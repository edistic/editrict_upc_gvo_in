import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('typeSelectSection').style.display = 'block';
    document.getElementById('adminSection').style.display = 'none';
    loadSavedData();
  } else {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('typeSelectSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'none';
  }
});

document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  signInWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Login Successful!"))
    .catch((error) => alert("Login Failed: " + error.message));
});

const logout = () => {
  signOut(auth).then(() => {
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
  });
};
document.getElementById('logoutBtn1').addEventListener('click', logout);
document.getElementById('logoutBtn2').addEventListener('click', logout);

const selectType = (type) => {
  document.getElementById('typeSelectSection').style.display = 'none';
  document.getElementById('adminSection').style.display = 'block';
  document.getElementById('cert_type').value = type;
  
  if(type === 'जाति प्रमाण पत्र') {
    document.getElementById('caste_field_group').style.display = 'block';
  } else {
    document.getElementById('caste_field_group').style.display = 'none';
    document.getElementById('caste_subcaste').value = "";
  }
};
document.getElementById('btnNivas').addEventListener('click', () => selectType('निवास प्रमाण पत्र'));
document.getElementById('btnJati').addEventListener('click', () => selectType('जाति प्रमाण पत्र'));

document.getElementById('backBtn').addEventListener('click', () => {
  document.getElementById('adminSection').style.display = 'none';
  document.getElementById('typeSelectSection').style.display = 'block';
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  const data = {
    cert_no: document.getElementById('cert_no').value,
    app_no: document.getElementById('app_no').value,
    issue_date: document.getElementById('issue_date').value,
    cert_type: document.getElementById('cert_type').value,
    caste_subcaste: document.getElementById('caste_subcaste').value,
    name: document.getElementById('name').value,
    father_name: document.getElementById('father_name').value,
    village: document.getElementById('village').value,
    tehsil: document.getElementById('tehsil').value,
    district: document.getElementById('district').value,
    issuer: document.getElementById('issuer').value,
    verifier: document.getElementById('verifier').value,
    timestamp: new Date().toISOString()
  };

  if(!data.cert_no || !data.name) {
    alert("कृपया प्रमाण पत्र संख्या और नाम भरें!");
    return;
  }

  try {
    document.getElementById('saveBtn').innerText = "Saving...";
    await addDoc(collection(db, "certificates"), data);
    alert("Data Saved Successfully!");
    
    const currentUrl = window.location.href.replace('admin.html', '');
    const verifyUrl = `${currentUrl}index.html?cert_no=${data.cert_no}`;
    
    document.getElementById('qrcode').innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
      text: verifyUrl,
      width: 128,
      height: 128
    });
    
    document.getElementById('qr-link').href = verifyUrl;
    document.getElementById('qrcode-container').style.display = 'block';
    
    document.getElementById('saveBtn').innerText = "Save & Generate QR";
    loadSavedData();
  } catch (e) {
    alert("Error adding document: " + e.message);
    document.getElementById('saveBtn').innerText = "Save & Generate QR";
  }
});

async function loadSavedData() {
  const querySnapshot = await getDocs(collection(db, "certificates"));
  const tbody = document.getElementById('dataTable');
  tbody.innerHTML = "";
  
  querySnapshot.forEach((docSnap) => {
    const cert = docSnap.data();
    const row = `<tr>
      <td>${cert.cert_no}</td>
      <td>${cert.name}</td>
      <td>${cert.cert_type}</td>
      <td>
        <button class="view-btn" onclick="window.open('index.html?cert_no=${cert.cert_no}', '_blank')">View</button>
        <button class="delete-btn" onclick="window.deleteRecord('${docSnap.id}')">Delete</button>
      </td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

window.deleteRecord = async (docId) => {
  if(confirm("Are you sure you want to delete this record?")) {
    await deleteDoc(doc(db, "certificates", docId));
    loadSavedData();
  }
};