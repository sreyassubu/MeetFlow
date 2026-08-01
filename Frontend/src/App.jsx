
import './App.css'
import Landing from './pages/Landing'
import Authentication from './pages/Authentication'
import {Routes,Route,BrowserRouter as Router} from "react-router-dom";
import AuthProvider from './contexts/AuthContext';
import VideoMeet from './pages/VideoMeet';
import Home from './pages/Home';
import History from './pages/History';
import ProtectedRoute from './pages/ProtectedRoute';

function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Landing/>}></Route>
          <Route path='/home' element={<Home/>}></Route>
          <Route path='/history' element={<ProtectedRoute><History/></ProtectedRoute>}></Route>
          <Route path='/auth' element={<Authentication/>}></Route>
          <Route path='/:url' element={<VideoMeet/>}></Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
