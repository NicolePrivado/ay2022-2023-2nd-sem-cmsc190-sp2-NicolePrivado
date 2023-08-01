import { 
  BrowserRouter, 
  Route, 
  Routes 
} from 'react-router-dom';
import {
  Inquiries,
  Analytics,
  Announcements,
  Directory,
  Home,
  Login,
  Notices,
  Upload,
  NotFound   
}from './pages/';
import {
  PageAuth 
}from './components/';
import "./style/pagetitle.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Login />} />
        <Route exact path='/home' element={ <PageAuth children={ <Home /> } /> } />
        <Route exact path='/upload' element={<PageAuth children={<Upload />}/>}/>
        <Route exact path='/notices' element={<PageAuth children={<Notices/>}/>}/>
        <Route exact path='/announcements' element={<PageAuth children={<Announcements />}/>}/>
        <Route exact path='/inquiries' element={<PageAuth children={<Inquiries />}/>}/>
        <Route exact path='/directory' element={<PageAuth children={<Directory />}/>}/>
        <Route exact path='/analytics' element={<PageAuth children={<Analytics />}/>}/>
        <Route exact path='*' element={<NotFound />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;