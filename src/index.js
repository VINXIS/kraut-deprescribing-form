// Evidence database
const evidenceData = {
    'vitamin-d': {
        title: 'Vitamin D',
        content: `<p>No evidence of fracture reduction with Vitamin D. Vitamin D and calcium might reduce fractures and hip fractures in women in LTC from 11.5% to 10.9 and 1.8% to 1.6%, might increase risk of renal calculi from 2.1 to 2.5%.</p>
        <p class="evidence-source">Tools for Practice #374 (2024)</p>`
    },
    'calcium': {
        title: 'Calcium',
        content: `<p>No evidence of fracture reduction with Vitamin D. Vitamin D and calcium might reduce fractures and hip fractures in women in LTC from 11.5% to 10.9 and 1.8% to 1.6%, might increase risk of renal calculi from 2.1 to 2.5%.</p>
        <p class="evidence-source">Tools for Practice #374 (2024)</p>`
    },
    'bisphosphonate': {
        title: 'Bisphosphonate',
        content: `<p>No evidence of reduction in clinical (non-vertebral) fractures with > 5 years of use.</p>
        <p class="evidence-source">Tools for Practice #33 (2015)</p>`
    },
    'statin': {
        title: 'Statin',
        content: `<p>No evidence of reduced mortality (primary prevention).</p>
        <p class="evidence-source">Systematic review and meta-analysis (frail older adults, 2024)</p>`
    },
    'acetylsalicylic-acid': {
        title: 'Acetylsalicylic Acid',
        content: `<p>No evidence of net benefit (primary prevention); ~1% absolute CVD benefit is offset by similar bleeding risk.</p>
        <p class="evidence-source">Tools for Practice #231 (2019)</p>`
    },
    'antihypertensive': {
        title: 'Antihypertensive',
        content: `<p>No evidence of reduced cardiovascular events, may be harmful (falls, orthostatic hypotension, cognition).</p>
        <p class="evidence-source">Narrative review (frail older adults, 2022)</p>`
    },
    'multivitamin': {
        title: 'Multivitamin',
        content: `<p>No evidence routine use reduces mortality, cardiovascular disease, and/or cancer.</p>
        <p class="evidence-source">Tools for practice #87 (2016)</p>`
    },
    'b12': {
        title: 'B12',
        content: `<p>No evidence of improvement in cognitive function, depressive symptoms, or fatigue when not deficient.</p>
        <p class="evidence-source">Systematic review (adults, 2021)</p>`
    },
    'bph-treatment': {
        title: 'BPH Treatment',
        content: `<p>Do not treat frail older adults who are incontinent with BPH and OAB medications.</p>
        <p class="evidence-source">International Consultation on Incontinence (frail older adults, 2020)</p>`
    },
    'overactive-bladder': {
        title: 'Overactive Bladder',
        content: `<p>Do not treat frail older adults who are incontinent with BPH and OAB medications.</p>
        <p class="evidence-source">International Consultation on Incontinence (frail older adults, 2020)</p>`
    },
    'antihyperglycemic': {
        title: 'Antihyperglycemic',
        content: `<p>Avoid HbA1C target &lt;7.5% (average 10.1 mmol/L glucose) as it is associated with net harm.</p>
        <p class="evidence-source">STOPPFrail (frail older adults, 2020)</p>`
    },
    'acetaminophen': {
        title: 'Acetaminophen',
        content: `<p>No evidence of improvement in pain.</p>
        <p class="evidence-source">Usage in LTC (frail older adults, 2025)</p>`
    },
    'melatonin': {
        title: 'Melatonin',
        content: `<p>No evidence it improves any aspect of sleep.</p>
        <p class="evidence-source">CADTH review (adults, 2022)</p>`
    },
    'iron': {
        title: 'Iron',
        content: `<p>Select low-dose iron as it has similar efficacy and fewer adverse effects.</p>
        <p class="evidence-source">Tools for practice (older adults, 2015)</p>`
    }
};

// State management
const formData = {
    patientInfo: {},
    medications: {},
    selections: {},
    comments: ''
};

let currentMedicationRow = null;
let currentOption = null;

// All medication keys that need to be checked
const allMedications = [
    'vitamin-d', 'calcium', 'bisphosphonate',
    'statin', 'acetylsalicylic-acid', 'antihypertensive',
    'multivitamin', 'b12',
    'bph-treatment', 'overactive-bladder',
    'antihyperglycemic',
    'acetaminophen', 'melatonin', 'iron'
];

// Medications that require medication name/details when Yes or No is selected
const medicationsNeedingDetails = {
    'bisphosphonate': 'name',
    'statin': 'name',
    'antihypertensive': 'name',
    'bph-treatment': 'name',
    'overactive-bladder': 'name',
    'antihyperglycemic': 'name',
    'acetaminophen': 'special',
    'iron': 'special'
};

// Validation function
function validateForm() {
    const errors = [];
    
    // Check patient info
    if (!formData.patientInfo.roomNumber || !formData.patientInfo.dob || 
        !formData.patientInfo.sex || !formData.patientInfo.physician ||
        !formData.patientInfo.regularMeds || !formData.patientInfo.prnMeds) {
        errors.push('Patient information is incomplete. Please fill in all patient details by clicking PATIENT STICKER.');
    }
    
    // Check all medications have a selection
    for (const med of allMedications) {
        if (!formData.selections[med]) {
            errors.push(`Please select NA, Yes, or No for ${med.replace(/-/g, ' ')}`);
        }
    }
    
    // Check medications that need details
    for (const [med, detailType] of Object.entries(medicationsNeedingDetails)) {
        const selection = formData.selections[med];
        if (selection === 'yes' || selection === 'no') {
            const medData = formData.medications[med];
            
            if (detailType === 'special') {
                if (med === 'acetaminophen') {
                    if (!medData || !medData.dose || !medData.frequency) {
                        errors.push(`Please provide dose and frequency for acetaminophen`);
                    }
                } else if (med === 'iron') {
                    if (!medData || !medData.name || !medData.frequency) {
                        errors.push(`Please provide medication name and frequency for iron`);
                    }
                }
            } else {
                if (!medData || !medData.name) {
                    errors.push(`Please provide medication name for ${med.replace(/-/g, ' ')}`);
                }
            }
        }
    }
    
    return errors;
}

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

// Evidence Modal - Click on medication names
document.querySelectorAll('.medication-name').forEach(elem => {
    elem.addEventListener('click', function(e) {
        e.stopPropagation();
        const row = this.closest('tr');
        const medicationKey = row.dataset.medication;
        
        if (evidenceData[medicationKey]) {
            document.getElementById('evidenceTitle').textContent = evidenceData[medicationKey].title;
            document.getElementById('evidenceContent').innerHTML = evidenceData[medicationKey].content;
            document.getElementById('evidenceModal').style.display = 'block';
        }
    });
});

document.getElementById('closeEvidence').addEventListener('click', function() {
    document.getElementById('evidenceModal').style.display = 'none';
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
        
        // Don't show popup for N/A
        if (option === 'na') {
            return;
        }
        
        // Check if this medication needs a popup
        const noPopup = row.dataset.noPopup === 'true';
        const specialPopup = row.dataset.specialPopup;
        
        currentMedicationRow = medicationKey;
        currentOption = option;
        
        if (specialPopup === 'acetaminophen') {
            // Show acetaminophen modal
            const existing = formData.medications[medicationKey] || {};
            document.getElementById('acetaminophenDose').value = existing.dose || '';
            document.getElementById('acetaminophenFrequency').value = existing.frequency || '';
            document.getElementById('acetaminophenModal').style.display = 'block';
        } else if (specialPopup === 'iron') {
            // Show iron modal
            const existing = formData.medications[medicationKey] || {};
            document.getElementById('ironName').value = existing.name || '';
            document.getElementById('ironFrequency').value = existing.frequency || '';
            document.getElementById('ironModal').style.display = 'block';
        } else if (!noPopup) {
            // Show regular medication name modal
            document.getElementById('medicationName').value = formData.medications[medicationKey]?.name || '';
            document.getElementById('medicationModal').style.display = 'block';
        }
    });
});

// Regular Medication Name Modal
document.getElementById('saveMedicationName').addEventListener('click', function() {
    const medicationName = document.getElementById('medicationName').value;
    if (currentMedicationRow) {
        formData.medications[currentMedicationRow] = { name: medicationName };
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

// Acetaminophen Modal
document.getElementById('saveAcetaminophen').addEventListener('click', function() {
    const dose = document.getElementById('acetaminophenDose').value;
    const frequency = document.getElementById('acetaminophenFrequency').value;
    if (currentMedicationRow) {
        formData.medications[currentMedicationRow] = { dose, frequency };
    }
    document.getElementById('acetaminophenModal').style.display = 'none';
});

document.getElementById('cancelAcetaminophen').addEventListener('click', function() {
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
    document.getElementById('acetaminophenModal').style.display = 'none';
});

// Iron Modal
document.getElementById('saveIron').addEventListener('click', function() {
    const name = document.getElementById('ironName').value;
    const frequency = document.getElementById('ironFrequency').value;
    if (currentMedicationRow) {
        formData.medications[currentMedicationRow] = { name, frequency };
    }
    document.getElementById('ironModal').style.display = 'none';
});

document.getElementById('cancelIron').addEventListener('click', function() {
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
    document.getElementById('ironModal').style.display = 'none';
});

// Comments
document.getElementById('comments').addEventListener('input', function() {
    formData.comments = this.value;
});

// Submit to Google Sheets
document.getElementById('submitBtn').addEventListener('click', async function() {
    // Validate form
    const errors = validateForm();
    
    if (errors.length > 0) {
        alert('Please complete the following:\n\n' + errors.join('\n'));
        return;
    }
    
    // Confirmation dialog
    const confirmed = confirm('Are you sure you want to submit this form? Please review all entries before confirming.');
    
    if (!confirmed) {
        return;
    }
    
    // Helper function to get selection value (NA, Yes, No)
    const getSelection = (key) => {
        const sel = formData.selections[key];
        if (sel === 'na') return 'NA';
        if (sel === 'yes') return 'Yes';
        if (sel === 'no') return 'No';
        return '';
    };
    
    // Helper function to get medication name
    const getMedName = (key) => {
        return formData.medications[key]?.name || '';
    };
    
    // Prepare data in exact CSV column order
    console.log(formData);
    const submissionData = {
        // Room info (columns 1-8)
        roomNumber: formData.patientInfo.roomNumber || '',
        dob: formData.patientInfo.dob || '',
        sex: formData.patientInfo.sex || '',
        physician: formData.patientInfo.physician || '',
        regularMeds: formData.patientInfo.regularMeds || '',
        prnMeds: formData.patientInfo.prnMeds || '',
        filledOutBy: '', // You can add this field if needed
        date: new Date().toLocaleDateString(),
        
        // Vitamin D (column 9)
        vitaminD: getSelection('vitamin-d'),
        
        // Calcium (column 10)
        calcium: getSelection('calcium'),
        
        // Bisphosphonate (columns 11-12)
        bisphosphonate: getSelection('bisphosphonate'),
        bisphosphonateName: getMedName('bisphosphonate'),
        
        // Statin (columns 13-14)
        statin: getSelection('statin'),
        statinName: getMedName('statin'),
        
        // ASA (column 15)
        asa: getSelection('acetylsalicylic-acid'),
        
        // Antihypertensive (columns 16-17)
        antihypertensive: getSelection('antihypertensive'),
        antihypertensiveName: getMedName('antihypertensive'),
        
        // Multivitamin (column 18)
        multivitamin: getSelection('multivitamin'),
        
        // B12 (column 19)
        b12: getSelection('b12'),
        
        // BPH (columns 20-21)
        bph: getSelection('bph-treatment'),
        bphName: getMedName('bph-treatment'),
        
        // Overactive bladder (columns 22-23)
        overactiveBladder: getSelection('overactive-bladder'),
        overactiveBladderName: getMedName('overactive-bladder'),
        
        // Antihyperglycemic (columns 24-25)
        antihyperglycemic: getSelection('antihyperglycemic'),
        antihyperglycemicName: getMedName('antihyperglycemic'),
        
        // Acetaminophen (column 26)
        acetaminophen: getSelection('acetaminophen'),
        acetaminophenDose: formData.medications['acetaminophen']?.dose || '',
        acetaminophenFrequency: formData.medications['acetaminophen']?.frequency || '',
        
        // Melatonin (column 27)
        melatonin: getSelection('melatonin'),
        
        // Iron (column 28)
        iron: getSelection('iron'),
        ironName: formData.medications['iron']?.name || '',
        ironFrequency: formData.medications['iron']?.frequency || '',
        
        // Comments (column 29)
        comments: formData.comments || '',
        
        // Monitoring columns (30-35) - leave empty for now, to be filled during monitoring
        needsMonitoring: '',
        monitoringDate: '',
        averageBP: '',
        briefsWet: '',
        averageBloodSugar: '',
        averagePainScore: ''
    };
    console.log(submissionData);
    
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxCD3WBx7BSFp9HVaI3bBaVgmXsa7Gd72a1LrLB61o5BuXAp0Vg4XTV_-QkaEm6yPCi/exec';
    
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
        alert('There was an error submitting the form. Please check the console for details.');
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