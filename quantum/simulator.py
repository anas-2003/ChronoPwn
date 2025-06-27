import numpy as np
from math import gcd

class QuantumSimulator:
    def __init__(self, qubits=8):
        self.qubits = qubits
        self.max_val = 2**qubits
        
    def qft(self, state):
        """Quantum Fourier Transform implementation"""
        n = len(state)
        output = np.zeros(n, dtype=complex)
        for k in range(n):
            for j in range(n):
                output[k] += state[j] * np.exp(2j * np.pi * j * k / n)
            output[k] /= np.sqrt(n)
        return output
        
    def find_period(self, a, N):
        """Find the period of f(x) = a^x mod N using quantum simulation"""
        # Initialize quantum state
        state = np.zeros(self.max_val, dtype=complex)
        state[0] = 1
        
        # Apply quantum Fourier transform
        state = self.qft(state)
        
        # Simulate modular exponentiation
        for x in range(self.max_val):
            fx = pow(a, x, N)
            state[x] = np.exp(2j * np.pi * fx * x / N)
            
        # Apply inverse quantum Fourier transform
        state = np.conj(self.qft(np.conj(state)))
        
        # Find most probable state (simulated measurement)
        max_idx = np.argmax(np.abs(state))
        return max_idx
        
    def shors_algorithm(self, N):
        """Simulate Shor's algorithm for factoring N"""
        if N % 2 == 0:
            return 2
            
        # Find random a < N
        a = 2
        while gcd(a, N) != 1:
            a = np.random.randint(3, N)
            
        # Find period r of a^x mod N
        r = self.find_period(a, N)
        
        # Check if r is even and a^(r/2) != -1 mod N
        if r % 2 == 0:
            x = pow(a, r//2, N)
            if x != N-1:
                factors = [gcd(x-1, N), gcd(x+1, N)]
                return factors
                
        return None

# Example usage
if __name__ == "__main__":
    simulator = QuantumSimulator(qubits=6)
    N = 15  # Number to factor
    factors = simulator.shors_algorithm(N)
    print(f"Factors of {N}: {factors}")