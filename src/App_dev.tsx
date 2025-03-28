import './App.css'
import './index.scss';
import Chat from './components/Chat'
import ChatScreen from './compenents_dev/ChatScreen'

function App_dev() {
  return (
    <div className="app dev-mode">
      <h1>Simple Chat App</h1>
      <ChatScreen />
      <p className="read-the-docs">
        This is a simple chat application with dummy responses
      </p>
    </div>
  )
}

export default App_dev
