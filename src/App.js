import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import {getSupabaseClient} from './models/supabase'
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Avatars from './pages/Avatars/Avatars';

const supabase = getSupabaseClient();

function App() {
  return (
    <BrowserRouter basename='/'>
      <Routes>
        <Route path='' element={<Home/>}/>
        <Route path='login' element={<Login/>}/>
        <Route path='avatars' element={<Avatars/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
