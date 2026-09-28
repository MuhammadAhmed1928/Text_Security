# SecureText — Web-Based Text Encryption Tool

A simple, browser-based web application for encrypting, decrypting, encoding, and hashing text using a collection of classical and modern cryptographic techniques.

## Overview

SecureText provides an easy-to-use interface where users can:

- Enter text
- Select a cryptographic technique
- Provide a key, shift, or password when required
- Encrypt or decrypt supported text
- Generate cryptographic hashes
- Copy results to the clipboard

The application is built entirely with HTML, CSS, and JavaScript and runs directly in a modern web browser.

## Features

- Caesar Cipher
- Vigenère Cipher
- Vigenère Autokey
- Vernam Cipher
- One-Time Pad
- Base64 Encoding/Decoding
- AES-256-GCM Encryption/Decryption
- SHA-256 Hashing
- Input validation
- Copy-to-clipboard functionality
- Responsive user interface
- No external JavaScript libraries required

## Technologies

- **HTML5** — application structure
- **CSS3** — styling and responsive layout
- **JavaScript (ES6+)** — application and cryptographic logic
- **Web Crypto API** — AES-GCM, PBKDF2, SHA-256, and secure random values
- **Clipboard API** — copying generated results

## Cryptographic Techniques

### Caesar Cipher

A substitution cipher that shifts alphabetic characters by a fixed number of positions.

**Encryption:**

```text
C = (P + shift) mod 26
```

**Decryption:**

```text
P = (C - shift) mod 26
```

The application supports shift values from `0` to `25`.

### Vigenère Cipher

A polyalphabetic substitution cipher that uses a repeating keyword.

**Encryption:**

```text
Eᵢ = (Pᵢ + Kᵢ) mod 26
```

**Decryption:**

```text
Dᵢ = (Eᵢ - Kᵢ) mod 26
```

Alphabetic characters are represented using values from `A = 0` to `Z = 25`.

### Vigenère Autokey

An extension of the Vigenère cipher in which the initial keyword is followed by plaintext characters to form the running key.

```text
Running Key = Initial Key + Plaintext
```

The application supports both encryption and decryption.

### Vernam Cipher

A Vernam implementation based on XOR operations over alphabetic values.

```text
A = 0
B = 1
...
Z = 25
```

The key must contain the same number of alphabetic characters as the message.

### One-Time Pad

A modulo-26 transformation using a key of the same length as the plaintext.

**Encryption:**

```text
Cᵢ = (Pᵢ + Kᵢ) mod 26
```

**Decryption:**

```text
Pᵢ = (Cᵢ - Kᵢ) mod 26
```

A true One-Time Pad requires a secure random key equal in length to the plaintext, secure key distribution, and one-time use of the key.

### Base64

Base64 is used for encoding and decoding text.

> **Note:** Base64 is an encoding scheme, not an encryption algorithm, and does not provide confidentiality.

### AES-256-GCM

AES-256-GCM provides authenticated symmetric encryption through the Web Crypto API.

The implementation uses:

- AES-GCM
- 256-bit encryption key
- PBKDF2 key derivation
- SHA-256
- 100,000 PBKDF2 iterations
- Random salt
- Random initialization vector (IV)

The generated ciphertext uses the following format:

```text
AES256GCM$salt$iv$ciphertext
```

The same password is required for successful decryption.

### SHA-256

SHA-256 produces a 256-bit cryptographic hash represented as a 64-character hexadecimal string.

> **Note:** SHA-256 is a one-way hash function and cannot be decrypted.

## Input Validation

The application validates common input requirements, including:

- Empty text input
- Missing encryption method
- Invalid Caesar shift values
- Invalid keys
- Key/message length requirements for Vernam and One-Time Pad
- Missing AES password

## Project Structure

```text
Web_Text_Encryption_Tool/
│
├── index.html
├── style.css
├── script.js
├── TEST_CASES.txt
│
└── report/
    └── Assignment_2_Report.docx
```

| File | Description |
|---|---|
| `index.html` | Main application structure and interface |
| `style.css` | Styling, layout, and responsive design |
| `script.js` | Encryption, decryption, hashing, validation, and UI logic |
| `TEST_CASES.txt` | Test cases and expected results |
| `report/Assignment_2_Report.docx` | Project report |

## Getting Started

### Run Directly

1. Download or clone the repository.
2. Open the project folder.
3. Open `index.html` in a modern web browser.

### Using Visual Studio Code

1. Open the project folder in Visual Studio Code.
2. Open `index.html`.
3. Run the file in a modern web browser.

For local development, the project can also be opened using the **Live Server** extension.

## Example

For a Vigenère encryption:

```text
Plaintext:  MAKE IT HAPPEN NOW
Key:        PASWD
```

Select **Vigenère Cipher**, enter the key, and click the encryption button to generate the ciphertext.

The same key can be used with the decryption option to recover the original text.

## Testing

The repository includes `TEST_CASES.txt` with examples for the implemented techniques.

Some basic examples:

| Algorithm | Input | Key / Setting | Expected Result |
|---|---|---|---|
| Caesar | `HELLO` | Shift `3` | `KHOOR` |
| Vigenère | `MAKE IT HAPPEN NOW` | `PASWD` | `BACA LI HSLSTN FKZ` |
| Autokey | `HELLO` | `N` | `ULPWZ` |
| Vernam | `OAK` | `SON` | `COH` |
| One-Time Pad | `HELLO` | `MONEY` | `TSYPM` |
| Base64 | `Hello` | — | `SGVsbG8=` |

AES-256-GCM can be tested by encrypting text with a password and then decrypting the generated ciphertext using the same password.

## Security Notes

This project is intended for learning and demonstration purposes.

- Classical ciphers such as Caesar and Vigenère are not suitable for protecting sensitive information in modern applications.
- Base64 provides encoding, not encryption.
- SHA-256 is a one-way hash function.
- AES-256-GCM provides modern authenticated encryption.
- A secure One-Time Pad requires proper random key generation, secure key distribution, equal key/plaintext length, and single-use keys.
- Cryptographic implementations should be carefully reviewed and tested before being used in real-world security systems.


