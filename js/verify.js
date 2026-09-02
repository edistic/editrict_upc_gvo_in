import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js"; 

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const certNo = urlParams.get('cert_no');

async function verifyCertificate() {
  if (!certNo) {
    document.getElementById('loading-msg').innerText = "Invalid QR Code or Certificate Number Missing.";
    return;
  }

  try {
    const q = query(collection(db, "certificates"), where("cert_no", "==", certNo));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      document.getElementById('loading-msg').innerText = "No Record Found for this Certificate Number!";
      document.getElementById('loading-msg').style.color = "red";
    } else {
      let certData = null;
      querySnapshot.forEach((doc) => {
        certData = doc.data();
      });

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

      if (certData.cert_type === 'जाति प्रमाण पत्र') {
        const casteRow = document.getElementById('d_caste_row');
        if (casteRow) casteRow.style.display = 'table-row';
        const casteSubcaste = document.getElementById('d_caste_subcaste');
        if (casteSubcaste) casteSubcaste.innerText = certData.caste_subcaste || "-";
      }

      const now = new Date();
      document.getElementById('current_time').innerText = "Certificate Verification as on : " + now.toLocaleString();

      document.getElementById('loading-msg').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';
    }
  } catch (error) {
    document.getElementById('loading-msg').innerText = "Error connecting to Database: " + error.message;
  }
}

verifyCertificate();