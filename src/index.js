// State management
const formData = {
    patientInfo: {},
    medications: {},
    selections: {},
    comments: ''
};

let currentMedicationRow = null;
let currentOption = null;

// Patient Info Modal
document.getElementById('patientSticker').addEventListener('click', function() {
    document.getElementById('patientModal').style.display = 'block';
});

document.getElementById('savePatientInfo').addEventListener('click', function() {
    const patientInfo = {
        roomNumber: document.getElementById('roomNumber').value,
        dob: document.getElementById('dob').value,
        sex: document.getElementById('sex').value,
        physician: document.getElementById('physician').value,
        regularMeds: document.getElementById('regularMeds').value,
        prnMeds: document.getElementById('prnMeds').value
    };
    
    formData.patientInfo = patientInfo;
    
    const sticker = document.getElementById('patientSticker');
    sticker.innerHTML = `
        <div class="patient-info">
            Room: ${patientInfo.roomNumber}<br>
            DOB: ${patientInfo.dob}<br>
            Sex: ${patientInfo.sex}<br>
            Physician: ${patientInfo.physician}
        </div>
    `;
    
    document.getElementById('patientModal').style.display = 'none';
});

document.getElementById('cancelPatientInfo').addEventListener('click', function() {
    document.getElementById('patientModal').style.display = 'none';
});

// Medication selection handling
document.querySelectorAll('.checkbox-cell[data-option]').forEach(cell => {
    cell.addEventListener('click', function() {
        const row = this.closest('tr');
        const medicationKey = row.dataset.medication;
        
        if (!medicationKey) return;
        
        const option = this.dataset.option;
        
        // Remove selection from all cells in this row
        row.querySelectorAll('.checkbox-cell[data-option]').forEach(c => {
            c.classList.remove('selected');
            c.textContent = '';
        });
        
        // Select this cell
        this.classList.add('selected');
        this.textContent = '✓';
        
        // Store selection
        formData.selections[medicationKey] = option;
        
        // Show medication name modal
        currentMedicationRow = medicationKey;
        currentOption = option;
        document.getElementById('medicationName').value = formData.medications[medicationKey] || '';
        document.getElementById('medicationModal').style.display = 'block';
    });
});

// Medication Name Modal
document.getElementById('saveMedicationName').addEventListener('click', function() {
    const medicationName = document.getElementById('medicationName').value;
    if (currentMedicationRow) {
        formData.medications[currentMedicationRow] = medicationName;
    }
    document.getElementById('medicationModal').style.display = 'none';
});

document.getElementById('cancelMedicationName').addEventListener('click', function() {
    // Remove the selection if cancelled
    if (currentMedicationRow) {
        const row = document.querySelector(`tr[data-medication="${currentMedicationRow}"]`);
        if (row) {
            row.querySelectorAll('.checkbox-cell[data-option]').forEach(c => {
                c.classList.remove('selected');
                c.textContent = '';
            });
        }
        delete formData.selections[currentMedicationRow];
    }
    document.getElementById('medicationModal').style.display = 'none';
});

// Comments
document.getElementById('comments').addEventListener('input', function() {
    formData.comments = this.value;
});

// Submit to Google Sheets
document.getElementById('submitBtn').addEventListener('click', async function() {
    // Prepare data for submission
    const submissionData = {
        timestamp: new Date().toISOString(),
        ...formData.patientInfo,
        medications: formData.medications,
        selections: formData.selections,
        comments: formData.comments
    };
    
    // NOTE: Replace this URL with your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData)
        });
        
        alert('Form submitted successfully! You can now print the form.');
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting the form. Please check the console for details.\n\nNote: You need to replace YOUR_GOOGLE_APPS_SCRIPT_URL_HERE with your actual Google Apps Script URL.');
    }
});

// Print functionality
document.getElementById('printBtn').addEventListener('click', function() {
    window.print();
});

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});