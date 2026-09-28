const $ = (id) => document.getElementById(id);

const inputText = $("inputText");
const outputText = $("outputText");
const algorithm = $("algorithm");
const shift = $("shift");
const key = $("key");
const password = $("password");
const shiftBox = $("shiftBox");
const keyBox = $("keyBox");
const keyLabel = $("keyLabel");
const keyHint = $("keyHint");
const passwordBox = $("passwordBox");
const message = $("message");

const KEY_ALGORITHMS = new Set(["vigenere", "autokey", "vernam", "otp"]);
const SAME_LENGTH_ALGORITHMS = new Set(["vernam", "otp"]);

algorithm.addEventListener("change", updateControls);

function updateControls() {
  const selected = algorithm.value;
  shiftBox.classList.toggle("hidden", selected !== "caesar");
  keyBox.classList.toggle("hidden", !KEY_ALGORITHMS.has(selected));
  passwordBox.classList.toggle("hidden", selected !== "aes");

  if (selected === "vigenere") {
    keyLabel.textContent = "Vigenère Keyword";
    keyHint.textContent = "Example from lecture: PASWD. The keyword repeats over the letters.";
    key.placeholder = "e.g. PASWD";
  } else if (selected === "autokey") {
    keyLabel.textContent = "Autokey Keyword";
    keyHint.textContent = "The keyword is followed by plaintext letters to create the running key.";
    key.placeholder = "e.g. N";
  } else if (selected === "vernam") {
    keyLabel.textContent = "Vernam Key";
    keyHint.textContent = "Lecture method: key length must equal the number of letters in the message.";
    key.placeholder = "e.g. RANCHOBABA";
  } else if (selected === "otp") {
    keyLabel.textContent = "One-Time Pad Key";
    keyHint.textContent = "Use a fresh random key with the same number of letters as the message.";
    key.placeholder = "e.g. MONEY";
  }

  clearMessage();
}

function showMessage(text, error = false) {
  message.textContent = text;
  message.className = "message" + (error ? " error" : "");
}
function clearMessage() {
  message.textContent = "";
  message.className = "message hidden";
}
function validateInput() {
  if (!inputText.value.trim()) {
    showMessage("Please enter some text first.", true);
    inputText.focus();
    return false;
  }
  if (!algorithm.value) {
    showMessage("Please select an encryption method.", true);
    algorithm.focus();
    return false;
  }
  return true;
}

function cleanKey(value) {
  return value.toUpperCase().replace(/[^A-Z]/g, "");
}

function letterCount(text) {
  return (text.match(/[A-Za-z]/g) || []).length;
}

function caesarTransform(text, amount) {
  return [...text].map(ch => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCharCode((code - 65 + amount + 26) % 26 + 65);
    }
    if (code >= 97 && code <= 122) {
      return String.fromCharCode((code - 97 + amount + 26) % 26 + 97);
    }
    return ch;
  }).join("");
}

// Vigenère as presented in the lecture: C_i = (P_i + K_i) mod 26,
// D_i = (C_i - K_i) mod 26. Non-letters are preserved.
function vigenereTransform(text, keyword, decrypt = false) {
  const k = cleanKey(keyword);
  if (!k) throw new Error("Please enter an alphabetic Vigenère keyword.");

  let keyIndex = 0;
  return [...text].map(ch => {
    const code = ch.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    if (!isUpper && !isLower) return ch;

    const p = isUpper ? code - 65 : code - 97;
    const kv = k.charCodeAt(keyIndex % k.length) - 65;
    keyIndex++;
    const value = decrypt ? (p - kv + 26) % 26 : (p + kv) % 26;
    return String.fromCharCode(value + (isUpper ? 65 : 97));
  }).join("");
}

// Vigenère Autokey: keyword + recovered plaintext form the running key.
function autokeyEncrypt(text, keyword) {
  const k = cleanKey(keyword);
  if (!k) throw new Error("Please enter an alphabetic Autokey keyword.");

  const letters = [...text].filter(ch => /[A-Za-z]/.test(ch)).map(ch => ch.toUpperCase());
  const stream = (k + letters.join(""));
  let keyIndex = 0;

  return [...text].map(ch => {
    const code = ch.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    if (!isUpper && !isLower) return ch;

    const p = isUpper ? code - 65 : code - 97;
    const kv = stream.charCodeAt(keyIndex) - 65;
    keyIndex++;
    const value = (p + kv) % 26;
    return String.fromCharCode(value + (isUpper ? 65 : 97));
  }).join("");
}

function autokeyDecrypt(text, keyword) {
  const k = cleanKey(keyword);
  if (!k) throw new Error("Please enter an alphabetic Autokey keyword.");

  let recovered = "";
  let keyIndex = 0;
  let plaintextLetterIndex = 0;

  return [...text].map(ch => {
    const code = ch.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    if (!isUpper && !isLower) return ch;

    const c = isUpper ? code - 65 : code - 97;
    let kv;
    if (plaintextLetterIndex < k.length) {
      kv = k.charCodeAt(plaintextLetterIndex) - 65;
    } else {
      kv = recovered.charCodeAt(plaintextLetterIndex - k.length) - 65;
    }

    const value = (c - kv + 26) % 26;
    const plainChar = String.fromCharCode(value + (isUpper ? 65 : 97));
    recovered += plainChar.toUpperCase();
    plaintextLetterIndex++;
    keyIndex++;
    return plainChar;
  }).join("");
}

function validateSameLengthKey(text, keyValue, algorithmName) {
  const k = cleanKey(keyValue);
  const required = letterCount(text);
  if (!k) throw new Error(`Please enter an alphabetic ${algorithmName} key.`);
  if (k.length !== required) {
    throw new Error(`${algorithmName} key must contain exactly ${required} letters for this message.`);
  }
  return k;
}

// Vernam method exactly follows the supplied lecture's examples:
// A=0...Z=25, bitwise XOR, then subtract 26 when the XOR result >= 26.
function vernamEncrypt(text, keyValue) {
  const k = validateSameLengthKey(text, keyValue, "Vernam");
  let index = 0;
  return [...text].map(ch => {
    const code = ch.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    if (!isUpper && !isLower) return ch;

    const p = (isUpper ? code - 65 : code - 97);
    const kv = k.charCodeAt(index++) - 65;
    let value = p ^ kv;
    if (value >= 26) value -= 26;
    return String.fromCharCode(value + (isUpper ? 65 : 97));
  }).join("");
}

function vernamDecrypt(text, keyValue) {
  // The lecture's Vernam procedure subtracts 26 from XOR results >= 26.
  // That reduction is many-to-one, so a ciphertext does not contain enough
  // information to define a unique inverse for every possible message.
  validateSameLengthKey(text, keyValue, "Vernam");
  throw new Error("The lecture's Vernam procedure is not uniquely reversible after the XOR value is reduced by 26. Use Encrypt for this exact lecture method.");
}


// One-Time Pad follows the concrete lecture example on page 23:
// C_i = (P_i + K_i) mod 26, with a key exactly as long as the message.
function oneTimePadTransform(text, keyValue, decrypt = false) {
  const k = validateSameLengthKey(text, keyValue, "One-Time Pad");
  let index = 0;
  return [...text].map(ch => {
    const code = ch.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    if (!isUpper && !isLower) return ch;

    const p = isUpper ? code - 65 : code - 97;
    const kv = k.charCodeAt(index++) - 65;
    const value = decrypt ? (p - kv + 26) % 26 : (p + kv) % 26;
    return String.fromCharCode(value + (isUpper ? 65 : 97));
  }).join("");
}

function base64Encode(text) {
  return btoa(unescape(encodeURIComponent(text)));
}
function base64Decode(text) {
  return decodeURIComponent(escape(atob(text)));
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}
function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

async function aesEncrypt(text, pass) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const baseKey = await crypto.subtle.importKey(
    "raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, key, enc.encode(text)
  );
  return `AES256GCM$${bytesToBase64(salt)}$${bytesToBase64(iv)}$${bytesToBase64(new Uint8Array(ciphertext))}`;
}

async function aesDecrypt(payload, pass) {
  const parts = payload.split("$");
  if (parts.length !== 4 || parts[0] !== "AES256GCM") {
    throw new Error("Invalid AES ciphertext format.");
  }
  const dec = new TextDecoder();
  const salt = base64ToBytes(parts[1]);
  const iv = base64ToBytes(parts[2]);
  const ciphertext = base64ToBytes(parts[3]);
  const baseKey = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return dec.decode(plain);
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

$("encryptBtn").addEventListener("click", async () => {
  clearMessage();
  if (!validateInput()) return;
  try {
    const text = inputText.value;
    switch (algorithm.value) {
      case "caesar": {
        const s = Number(shift.value);
        if (!Number.isInteger(s) || s < 0 || s > 25) throw new Error("Shift must be between 0 and 25.");
        outputText.value = caesarTransform(text, s);
        showMessage("Caesar encryption completed.");
        break;
      }
      case "vigenere":
        outputText.value = vigenereTransform(text, key.value, false);
        showMessage("Vigenère encryption completed using C = (P + K) mod 26.");
        break;
      case "autokey":
        outputText.value = autokeyEncrypt(text, key.value);
        showMessage("Vigenère Autokey encryption completed.");
        break;
      case "vernam":
        outputText.value = vernamEncrypt(text, key.value);
        showMessage("Vernam encryption completed using the lecture's XOR method.");
        break;
      case "otp":
        outputText.value = oneTimePadTransform(text, key.value, false);
        showMessage("One-Time Pad encryption completed using addition modulo 26.");
        break;
      case "base64":
        outputText.value = base64Encode(text);
        showMessage("Base64 encoding completed.");
        break;
      case "aes":
        if (!password.value) throw new Error("Please enter an AES password.");
        outputText.value = await aesEncrypt(text, password.value);
        showMessage("AES-256-GCM encryption completed.");
        break;
      case "sha256":
        outputText.value = await sha256(text);
        showMessage("SHA-256 hash generated. Hashing is one-way and cannot be decrypted.");
        break;
    }
  } catch (err) {
    showMessage(err.message || "Operation failed.", true);
  }
});

$("decryptBtn").addEventListener("click", async () => {
  clearMessage();
  if (!inputText.value.trim()) {
    showMessage("Paste the ciphertext into the input box first.", true);
    return;
  }
  if (!algorithm.value) {
    showMessage("Please select the method used for encryption.", true);
    return;
  }
  try {
    switch (algorithm.value) {
      case "caesar": {
        const s = Number(shift.value);
        if (!Number.isInteger(s) || s < 0 || s > 25) throw new Error("Shift must be between 0 and 25.");
        outputText.value = caesarTransform(inputText.value, -s);
        showMessage("Caesar decryption completed.");
        break;
      }
      case "vigenere":
        outputText.value = vigenereTransform(inputText.value, key.value, true);
        showMessage("Vigenère decryption completed using D = (E - K) mod 26.");
        break;
      case "autokey":
        outputText.value = autokeyDecrypt(inputText.value, key.value);
        showMessage("Vigenère Autokey decryption completed.");
        break;
      case "vernam":
        outputText.value = vernamDecrypt(inputText.value, key.value);
        showMessage("Vernam decryption is not uniquely defined for the exact lecture method.", true);
        break;
      case "otp":
        outputText.value = oneTimePadTransform(inputText.value, key.value, true);
        showMessage("One-Time Pad decryption completed.");
        break;
      case "base64":
        outputText.value = base64Decode(inputText.value.trim());
        showMessage("Base64 decoding completed.");
        break;
      case "aes":
        if (!password.value) throw new Error("Please enter the AES password.");
        outputText.value = await aesDecrypt(inputText.value.trim(), password.value);
        showMessage("AES-256-GCM decryption completed.");
        break;
      case "sha256":
        showMessage("SHA-256 is a one-way hash; decryption is not possible.", true);
        break;
    }
  } catch (err) {
    showMessage(err.message || "Decryption failed. Check the ciphertext, algorithm and key.", true);
  }
});

$("copyBtn").addEventListener("click", async () => {
  if (!outputText.value) {
    showMessage("There is no result to copy.", true);
    return;
  }
  try {
    await navigator.clipboard.writeText(outputText.value);
    showMessage("Result copied to clipboard.");
  } catch {
    outputText.select();
    document.execCommand("copy");
    showMessage("Result copied to clipboard.");
  }
});

$("clearBtn").addEventListener("click", () => {
  inputText.value = "";
  outputText.value = "";
  password.value = "";
  key.value = "";
  shift.value = 3;
  algorithm.value = "";
  updateControls();
  clearMessage();
});

updateControls();
