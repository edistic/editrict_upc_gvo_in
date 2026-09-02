import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js"; 

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// URL se cert_no nikalna
const urlParams = new URLSearchParams(window.location.search);
const certNo = urlParams.get('cert_no');

async function verifyCertificate() {
  const loader = document.getElementById('divLoading');
  
  try {
    // 1. Check agar URL mein cert_no nahi hai
    if (!certNo) {
      loader.innerHTML = "<div style='display:flex; justify-content:center; align-items:center; height:100vh;'><h2 style='color:red; background:white; padding:20px; border-radius:8px; border:2px solid red;'>⚠️ Error: URL mein Certificate Number nahi hai! (Jaise: ?cert_no=12345)</h2></div>";
      return;
    }

    // 2. Firebase Database Fetch Query
    const q = query(collection(db, "certificates"), where("cert_no", "==", certNo));
    const querySnapshot = await getDocs(q);

    // 3. Agar details database mein nahi milti
    if (querySnapshot.empty) {
      loader.innerHTML = "<div style='display:flex; justify-content:center; align-items:center; height:100vh;'><h2 style='color:red; background:white; padding:20px; border-radius:8px; border:2px solid red;'>❌ No Record Found! Is Certificate Number ka data nahi mila.</h2></div>";
      return;
    } 
    
    // 4. Data milne par variables me store karna
    let certData = null;
    querySnapshot.forEach((doc) => {
      certData = doc.data();
    });

    // 5. Data ko HTML me map karna
    document.getElementById('d_app_no').innerText = certData.app_no || "-";
    document.getElementById('d_cert_no').innerText = certData.cert_no || "-";
    document.getElementById('d_issue_date').innerText = certData.issue_date || "-";
    document.getElementById('d_cert_type').innerText = certData.cert_type || "-";
    document.getElementById('d_name').innerText = certData.name || "-";
    document.getElementById('d_father_name').innerText = certData.father_name || "-";
    document.getElementById('d_village').innerText = certData.village || "-";
    document.getElementById('d_tehsil').innerText = certData.tehsil || "-";
    document.getElementById('d_district').innerText = certData.district || "-";
    document.getElementById('d_issuer').innerText = certData.issuer || "-";
    document.getElementById('d_verifier').innerText = certData.verifier || "-";

    // Agar Jati Praman Patra hai toh extra field dikhana
    if (certData.cert_type === 'जाति प्रमाण पत्र') {
      const casteRow = document.getElementById('d_caste_row');
      if (casteRow) casteRow.style.display = 'table-row';
      const casteSubcaste = document.getElementById('d_caste_subcaste');
      if (casteSubcaste) casteSubcaste.innerText = certData.caste_subcaste || "-";
    }

    // Aaj ki Date & Time
    const now = new Date();
    document.getElementById('current_time').innerText = "Certificate Verification as on : " + now.toLocaleString();

    // 6. ✔️ SUCCESS: Loader (Circle) ko hide karo aur main content dikhao
    loader.classList.remove('show');
    loader.style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

  } catch (error) {
    // Agar koi Technical Error aati hai toh Screen par dikhayega
    console.error("Firebase Error: ", error);
    loader.innerHTML = `<div style='display:flex; justify-content:center; align-items:center; height:100vh;'><h2 style='color:red; background:white; padding:20px; border-radius:8px; border:2px solid red;'>⚠️ System Error: ${error.message}</h2></div>`;
  }
}

// Function call
verifyCertificate();
