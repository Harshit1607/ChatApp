import styles from './App.module.scss';
import ChatHome from './Chat/ChatHome/ChatHome';
import ConversationHome from './Conversation/ConversationHome/ConversationHome';
import Navbar from './Navbar/Navbar';

function App() {
  return (
    <div className={styles.App}>
      <Navbar />
      <ConversationHome />
      <ChatHome />
    </div>
  );
}

export default App;
