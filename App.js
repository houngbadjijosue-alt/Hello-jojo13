
/**
 * UCAO IIM-GTTIC - Main App (simplified single-file starter)
 * Replace environment variables with your Firebase config.
 */
import React, { useEffect, useState, createContext, useContext } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const AppContext = createContext(null);

function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);
  return user;
}

function Header() {
  const { user } = useContext(AppContext);
  return (
    <header style={{padding:16, display:'flex', justifyContent:'space-between', alignItems:'center', background:'#0D6EFD', color:'#fff'}}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={{width:40, height:40, borderRadius:20, background:'#00000033', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700}}>U</div>
        <h1 style={{margin:0}}>UCAO IIM-GTTIC</h1>
      </div>
      <nav style={{display:'flex', gap:12}}>
        <a href="#/" style={{color:'#fff'}}>Accueil</a>
        <a href="#/annonces" style={{color:'#fff'}}>Annonces</a>
        <a href="#/ressources" style={{color:'#fff'}}>Ressources</a>
        <a href="#/membres" style={{color:'#fff'}}>Membres</a>
        {user ? <a href="#/profil" style={{color:'#fff'}}>Profil</a> : <a href="#/login" style={{color:'#fff'}}>Se connecter</a>}
      </nav>
    </header>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useContext(AppContext);

  const handleLogin = async () => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(cred.user);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRegister = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'profiles', cred.user.uid), { email: cred.user.email, createdAt: serverTimestamp() });
      setUser(cred.user);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{padding:20, background:'#1E1E1E', color:'#EAEAEA', maxWidth:600, margin:'20px auto'}}>
      <h2>Connexion / Inscription</h2>
      {error && <div style={{background:'#8B0000', padding:8}}>{error}</div>}
      <input style={{width:'100%', padding:8, marginTop:8}} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email ou matricule" />
      <input style={{width:'100%', padding:8, marginTop:8}} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" />
      <div style={{display:'flex', gap:8, marginTop:8}}>
        <button onClick={handleLogin} style={{padding:'8px 12px', background:'#00FFB2', border:'none'}}>Se connecter</button>
        <button onClick={handleRegister} style={{padding:'8px 12px', border:'1px solid #00FFB2', background:'transparent', color:'#00FFB2'}}>S'inscrire</button>
      </div>
    </div>
  );
}

function Card({title, desc, link}) {
  return (
    <a href={link} style={{display:'block', padding:12, background:'#2A2A2A', borderRadius:8, color:'#EAEAEA', textDecoration:'none'}}>
      <h3 style={{margin:'0 0 6px 0'}}>{title}</h3>
      <p style={{margin:0}}>{desc}</p>
    </a>
  );
}

function Dashboard() {
  return (
    <div style={{padding:20}}>
      <h2 style={{color:'#EAEAEA'}}>Tableau de bord</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr', gap:12, marginTop:12}}>
        <Card title="Discussions" desc="Accède au chat général et par matière" link="#/forum" />
        <Card title="Annonces" desc="Voir les annonces officielles" link="#/annonces" />
        <Card title="Ressources" desc="Cours et documents partagés" link="#/ressources" />
        <Card title="Agenda" desc="Calendrier des cours et examens" link="#/agenda" />
      </div>
    </div>
  );
}

function Announcements() {
  const [annonces, setAnnonces] = useState([]);
  const [text, setText] = useState('');
  const { user } = useContext(AppContext);

  useEffect(()=>{
    (async ()=>{
      const snap = await getDocs(collection(db, 'annonces'));
      setAnnonces(snap.docs.map(d=>({id:d.id, ...d.data()})));
    })();
  },[]);

  const post = async ()=>{
    if(!user) return alert('Connecte-toi');
    await addDoc(collection(db,'annonces'), { text, author: user.uid, createdAt: serverTimestamp() });
    setText('');
    const snap = await getDocs(collection(db, 'annonces'));
    setAnnonces(snap.docs.map(d=>({id:d.id, ...d.data()})));
  };

  return (
    <div style={{padding:20, color:'#EAEAEA'}}>
      <h2>Annonces</h2>
      <textarea value={text} onChange={e=>setText(e.target.value)} style={{width:'100%', minHeight:80}} placeholder="Rédiger une annonce..." />
      <div style={{marginTop:8}}><button onClick={post} style={{padding:'8px 12px', background:'#00FFB2'}}>Publier</button></div>
      <div style={{marginTop:12}}>{annonces.map(a=><div key={a.id} style={{padding:8, background:'#111', marginTop:8}}>{a.text}</div>)}</div>
    </div>
  );
}

function Ressources() {
  const [files, setFiles] = useState([]);
  const [file,setFile] = useState(null);
  const { user } = useContext(AppContext);

  useEffect(()=>{
    (async ()=>{ const snap = await getDocs(collection(db,'ressources')); setFiles(snap.docs.map(d=>({id:d.id, ...d.data()}))); })();
  },[]);

  const upload = async ()=>{
    if(!user) return alert('Connecte-toi');
    if(!file) return alert('Choisis un fichier');
    const storageRef = sref(storage, `ressources/${Date.now()}_${file.name}`);
    const snap = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snap.ref);
    await addDoc(collection(db,'ressources'), { name: file.name, url, author: user.uid, createdAt: serverTimestamp() });
    const newSnap = await getDocs(collection(db,'ressources')); setFiles(newSnap.docs.map(d=>({id:d.id, ...d.data()})));
    setFile(null);
  };

  return (
    <div style={{padding:20, color:'#EAEAEA'}}>
      <h2>Ressources partagées</h2>
      <div style={{marginTop:8}}>
        <input type="file" onChange={e=>setFile(e.target.files[0])} />
        <button onClick={upload} style={{marginLeft:8, padding:'6px 10px', background:'#00FFB2'}}>Envoyer</button>
      </div>
      <ul style={{marginTop:12}}>{files.map(f=><li key={f.id}><a href={f.url} target="_blank" rel="noreferrer">{f.name}</a></li>)}</ul>
    </div>
  );
}

function Members() {
  const [profiles, setProfiles] = useState([]);
  useEffect(()=>{ (async ()=>{ const snap = await getDocs(collection(db,'profiles')); setProfiles(snap.docs.map(d=>({id:d.id, ...d.data()}))); })(); },[]);
  return (
    <div style={{padding:20, color:'#EAEAEA'}}>
      <h2>Membres</h2>
      <ul style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:8}}>{profiles.map(p=><li key={p.id} style={{padding:8, background:'#2A2A2A'}}>{p.email||'Étudiant'}</li>)}</ul>
    </div>
  );
}

function Profile() {
  const user = useAuth();
  const [profile,setProfile] = useState(null);
  useEffect(()=>{ (async ()=>{ if(!user) return; const d = await getDoc(doc(db,'profiles',user.uid)); if(d.exists()) setProfile(d.data()); })(); },[user]);
  if(!user) return <div style={{padding:20, color:'#EAEAEA'}}>Connecte-toi pour voir le profil.</div>;
  return (
    <div style={{padding:20, color:'#EAEAEA'}}>
      <h2>Mon profil</h2>
      <p>Email: {user.email}</p>
      <button onClick={()=>signOut(auth)} style={{marginTop:12, padding:'8px 12px', background:'#00FFB2'}}>Se déconnecter</button>
    </div>
  );
}

function AdminPanel() {
  const { user } = useContext(AppContext);
  const [admins, setAdmins] = useState([]);
  useEffect(()=>{ (async ()=>{ const snap = await getDocs(collection(db,'admins')); setAdmins(snap.docs.map(d=>({id:d.id, ...d.data()}))); })(); },[]);
  if(!user) return <div style={{padding:20, color:'#EAEAEA'}}>Connecte-toi</div>;
  return (
    <div style={{padding:20, color:'#EAEAEA'}}>
      <h2>Administration</h2>
      <p>Gère les responsables et le contenu.</p>
      <ul>{admins.map(a=><li key={a.id}>{a.id}</li>)}</ul>
    </div>
  );
}

function Router({route}) {
  switch(route) {
    case '/login': return <Login />;
    case '/annonces': return <Announcements />;
    case '/ressources': return <Ressources />;
    case '/membres': return <Members />;
    case '/profil': return <Profile />;
    case '/admin': return <AdminPanel />;
    default: return <Dashboard />;
  }
}

export default function App() {
  const user = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(()=>setCurrentUser(user),[user]);
  const [route, setRoute] = useState(window.location.hash.replace('#','')||'/');
  useEffect(()=>{ const onHash=()=>setRoute(window.location.hash.replace('#','')||'/'); window.addEventListener('hashchange', onHash); return ()=>window.removeEventListener('hashchange', onHash); },[]);
  return (
    <AppContext.Provider value={{user:currentUser, setUser:setCurrentUser}}>
      <div style={{minHeight:'100vh', background:'#1E1E1E', color:'#EAEAEA'}}>
        <Header />
        <main>{<Router route={route} />}</main>
      </div>
    </AppContext.Provider>
  );
}
