use std::{net::SocketAddr, sync::Arc};
use tokio::{
    net::{TcpListener, TcpStream},
    sync::Mutex,
};
use aes_gcm::{Aes256Gcm, KeyInit, aead::{Aead, AeadCore, OsRng}};
use aes_gcm::aead::generic_array::GenericArray;

type SharedState = Arc<Mutex<Vec<String>>>;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "0.0.0.0:5555";
    let listener = TcpListener::bind(addr).await?;
    println!("C2 Server listening on {}", addr);

    let state = Arc::new(Mutex::new(Vec::new()));

    loop {
        let (socket, remote_addr) = listener.accept().await?;
        let state = state.clone();

        tokio::spawn(async move {
            if let Err(e) = handle_connection(socket, remote_addr, state).await {
                eprintln!("Error handling connection: {}", e);
            }
        });
    }
}

async fn handle_connection(
    mut socket: TcpStream,
    addr: SocketAddr,
    state: SharedState,
) -> Result<(), Box<dyn std::error::Error>> {
    println!("New connection from {}", addr);
    
    // Generate random key for this session (in real implementation would use pre-shared key)
    let key = Aes256Gcm::generate_key(&mut OsRng);
    let cipher = Aes256Gcm::new(&key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng); // 12-byte nonce
    
    loop {
        // Read incoming data
        let mut buf = [0u8; 1024];
        let n = socket.readable().await?;
        let n = match socket.try_read(&mut buf) {
            Ok(n) => n,
            Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => continue,
            Err(e) => return Err(e.into()),
        };

        if n == 0 {
            println!("Connection closed by {}", addr);
            return Ok(());
        }

        let encrypted_data = &buf[..n];
        let plaintext = cipher.decrypt(&nonce, encrypted_data)
            .map_err(|e| format!("Decryption failed: {}", e))?;
        
        let command = String::from_utf8(plaintext)?;
        println!("Received command from {}: {}", addr, command);

        // Process command
        let response = match command.trim() {
            "status" => "OK".to_string(),
            "targets" => {
                let state = state.lock().await;
                serde_json::to_string(&*state)?
            }
            _ => "UNKNOWN_COMMAND".to_string(),
        };

        // Encrypt response
        let encrypted_response = cipher.encrypt(&nonce, response.as_bytes())
            .map_err(|e| format!("Encryption failed: {}", e))?;
        
        socket.writable().await?;
        socket.try_write(&encrypted_response)?;
    }
}