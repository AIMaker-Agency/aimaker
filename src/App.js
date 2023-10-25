import { BrowserRouter, Route, Routes, Redirect, Navigate } from 'react-router-dom';
import './App.css';
import {getSupabaseClient} from './models/supabase'
import Login from './pages/Login/Login';
import Avatars from './pages/Avatars/Avatars';
import Page404 from './pages/404/404';
import Homepage from './pages/Home/Homepage';
import Profile from './pages/Profile/Profile';

const supabase = getSupabaseClient();

function App() {
  return (
    <BrowserRouter basename='/'>
      <Routes>
        <Route exact path='/' element={<Navigate to="/home" replace={true}></Navigate>}></Route>
        <Route path='/home/*' element={<Homepage/>}/>
        <Route path='login' element={<Login/>}/>
        <Route path='avatars' element={<Avatars/>}/>
        <Route path='profile/*' element={<Profile/>}/>
        <Route path='/*' element={<Page404/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
