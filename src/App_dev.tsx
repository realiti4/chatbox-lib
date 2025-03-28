import './App.css'
import './index.scss';
import ChatScreen_dev from './compenents_dev/ChatScreen_dev'

function App_dev() {
  return (
    <div className="app dev-mode">
      <h1>Simple Chat App</h1>
      <ChatScreen_dev />
      <p className="read-the-docs">
        This is a simple chat application with dummy responses
      </p>
    </div>
  )
}

export default App_dev
