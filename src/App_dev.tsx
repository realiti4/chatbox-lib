// import './App.css'
import './index.scss';
import ChatScreen from './compenents_dev/ChatScreen'

function App_dev() {
  return (
    <div className="app dev-mode">
      <div className="chat-app-header">
        <h1>Simple Chat App</h1>
      </div>
      <div className="chat-container">
        <ChatScreen />
      </div>
      <p className="read-the-docs">
        This is a simple chat application with dummy responses
      </p>
    </div>
  )
}

export default App_dev
