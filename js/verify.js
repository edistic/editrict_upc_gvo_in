import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js"; 

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const certNo = urlParams.get('cert_no');

async function verifyCertificate() {
  // Loader element ko select kiya
  const loader = document.getElementById('divLoading');

  if (!certNo) {
    // Agar Certificate Number na ho, toh loader hata kar error dikhayega
    loader.innerHTML = "<h2 style='text-align:center; margin-top:50px; font-family:sans-serif; color:red; background: white; padding: 20px; display: inline-block; border-radius: 8px;'>Invalid QR Code or Certificate Number Missing.</h2>";
    return;
  }

  try {
    const q = query(collection(db, "certificates"), where("cert_no", "==", certNo));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Agar record na mile toh spinner hata kar error show karega
      loader.innerHTML = "<h2 style='text-align:center; margin-top:50px; font-family:sans-serif; color:red; background: white; padding: 20px; display: inline-block; border-radius: 8px;'>No Record Found for this Certificate Number!</h2>";
    } else {
      let certData = null;
      querySnapshot.forEach((doc) => {
        certData = doc.data();
      });

      // Data ko HTML me set kar rahe hain
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

      // ✅ MAIN ANIMATION LOGIC ✅
      // Data fetch hote hi loading animation ko hide karenge 
      loader.classList.remove('show');
      loader.style.display = 'none'; 
      // Aur main details wala page show karenge
      document.getElementById('main-content').style.display = 'block';
    }
  } catch (error) {
     // Network ya database ki koi error ho toh spinner rok kar yahan bata dega
     loader.innerHTML = "<h2 style='text-align:center; margin-top:50px; font-family:sans-serif; color:red; background: white; padding: 20px; display: inline-block; border-radius: 8px;'>Error connecting to Database: " + error.message + "</h2>";
  }
}

verifyCertificate();
