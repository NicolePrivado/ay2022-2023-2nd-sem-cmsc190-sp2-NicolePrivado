import {
    Header,
    Categories,
    Footer,
} from '../components/'
import "../style/home.css"
import uplb from '../images/UPLB.jpg'
import useStore from '../components/AuthHook'

const Home = () => {
    const { user } = useStore()
    return(
        <div>
            <img src = {uplb} className = 'home-bg'/>
            {user && user !== undefined ? <h1 className='home-greetings'>Good day, {user.name}!</h1>: <h1 className='home-greetings'>Good day!</h1>}
            <Categories />
            <Header />
            <Footer />
        </div>
    );
}

export default Home;