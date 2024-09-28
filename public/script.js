// script.js
const chatHistory = document.getElementById('chat-history');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (message !== '') {
    
    // Clear the input field immediately after capturing the message
    messageInput.value = '';

    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user-message');
    userMessage.textContent = message;
    chatHistory.appendChild(userMessage);

    fetch('/chat?message=' + encodeURIComponent(message))
      .then(response => response.json())
      .then(data => {
        const modelMessage = document.createElement('div');
        modelMessage.classList.add('message', 'model-message');

        // Convert the Markdown response to HTML
        modelMessage.innerHTML = marked.parse(data.response); // Use marked.js to convert Markdown to HTML
        // modelMessage.textContent = data.response;
        
        chatHistory.appendChild(modelMessage);

        // Scroll to the bottom of the chat window
        chatHistory.scrollTop = chatHistory.scrollHeight;
      })
      .catch(error => {
        console.error(error);
        alert('An error occurred while sending the message.');
      });
  }
}
