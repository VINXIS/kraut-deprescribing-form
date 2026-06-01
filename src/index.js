const LOCATION_CONFIG = {
    kingston: {
        label: 'Kingston',
        scriptUrl: 'https://script.google.com/macros/s/AKfycbzVdN-WSSqSScR7KcKE1g6o458ds43zBGgrgGKa_uGBvJrs8aTK70ppyy-HD6y_RUlE/exec'
    },
    ptcc: {
        label: 'Kingston PTCC',
        scriptUrl: 'https://script.google.com/macros/s/AKfycbxrKSR86k3dj_1MEP0oQrnmJJlFrTZuKRx-Hr-SdST9rEG4rCmxnn4Nqo7hhpDYVxosdA/exec'
    },
    rideaucrest: {
        label: 'Kingston Rideaucrest',
        scriptUrl: 'https://script.google.com/macros/s/AKfycbzyflzrCy6aNZQ9zCx5nxwW6QNjDp7EwW44x8nrp3K133lDo5fQdpXtCCoVq9les4Kv4Q/exec'
    }
};

const getLocationConfig = () => {
    const params = new URLSearchParams(window.location.search);
    const rawLocation = params.get('location');
    if (!rawLocation) {
        return null;
    }
    const key = rawLocation.trim().toLowerCase();
    return LOCATION_CONFIG[key] || null;
};

const renderInvalidUrlMessage = () => {
    const exampleUrl = `${window.location.origin}${window.location.pathname}?location=ptcc`;
    document.title = 'Invalid URL';
    document.body.innerHTML = `
        <main style="padding: 24px; font-family: Arial, sans-serif;">
            <h1 style="margin: 0 0 12px 0; font-size: 20px;">Invalid URL</h1>
            <p style="margin: 0 0 8px 0;">This link needs a location at the end.</p>
            <p style="margin: 0 0 8px 0;">Use a location like ptcc.</p>
            <p style="margin: 0;">Example: <a href="${exampleUrl}">${exampleUrl}</a></p>
        </main>
    `;
};

const locationConfig = getLocationConfig();
if (!locationConfig || !locationConfig.scriptUrl) {
    renderInvalidUrlMessage();
    // Stop running the rest of the app when the URL is invalid.
    throw new Error('Invalid URL: missing or unsupported location.');
}

const GOOGLE_SCRIPT_URL = locationConfig.scriptUrl;

// Evidence database
const evidenceData = {
    'vitamin-d': {
        title: 'Vitamin D',
        content: `<p>No evidence of fracture reduction with Vitamin D. Vitamin D and calcium might reduce fractures and hip fractures in women in LTC from 11.5% to 10.9 and 1.8% to 1.6%, might increase risk of renal calculi from 2.1 to 2.5%.</p>
        <p class="evidence-source"><a href="https://cfpclearn.ca/tfp374/" target="_blank" rel="noopener noreferrer">Tools for Practice #374</a> (2024)</p>`
    },
    'calcium': {
        title: 'Calcium',
        content: `<p>No evidence of fracture reduction with Vitamin D. Vitamin D and calcium might reduce fractures and hip fractures in women in LTC from 11.5% to 10.9 and 1.8% to 1.6%, might increase risk of renal calculi from 2.1 to 2.5%.</p>
        <p class="evidence-source"><a href="https://cfpclearn.ca/tfp374/" target="_blank" rel="noopener noreferrer">Tools for Practice #374</a> (2024)</p>`
    },
    'bisphosphonate': {
        title: 'Bisphosphonate',
        content: `<p>No evidence of reduction in clinical (non-vertebral) fractures with > 5 years of use.</p>
        <p class="evidence-source"><a href="https://cfpclearn.ca/tfp33/" target="_blank" rel="noopener noreferrer">Tools for Practice #33</a> (2015)</p>`
    },
    'statin': {
        title: 'Statin',
        content: `<p>No evidence of reduced mortality (primary prevention).</p>
        <p class="evidence-source">Systematic review and meta-analysis (<a href="https://pubmed.ncbi.nlm.nih.gov/37597795/" target="_blank" rel="noopener noreferrer">Mondal 2024</a>)</p>`
    },
    'acetylsalicylic-acid': {
        title: 'Acetylsalicylic Acid',
        content: `<p>No evidence of net benefit (primary prevention); ~1% absolute CVD benefit is offset by similar bleeding risk.</p>
        <p class="evidence-source"><a href="https://cfpclearn.ca/tfp231/" target="_blank" rel="noopener noreferrer">Tools for Practice #231</a> (2019)</p>`
    },
    'antihypertensive': {
        title: 'Antihypertensive',
        content: `<p>No evidence of reduced cardiovascular events, may be harmful (falls, orthostatic hypotension, cognition).</p>
        <p class="evidence-source">Narrative review (<a href="https://www.sciencedirect.com/science/article/pii/S2666602222000830?via%3Dihub" target="_blank" rel="noopener noreferrer">Kraut 2022</a>)</p>`
    },
    'multivitamin': {
        title: 'Multivitamin',
        content: `<p>No evidence routine use reduces mortality, cardiovascular disease, and/or cancer.</p>
        <p class="evidence-source"><a href="https://cfpclearn.ca/tfp87/" target="_blank" rel="noopener noreferrer">Tools for practice #87</a> (2016)</p>`
    },
    'b12': {
        title: 'B12',
        content: `<p>No evidence of improvement in cognitive function, depressive symptoms, or fatigue when not deficient.</p>
        <p class="evidence-source">Cochrane systematic review (<a href="https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD004514/full" target="_blank" rel="noopener noreferrer">Malouf 2003</a>)</p>`
    },
    'bph-treatment': {
        title: 'BPH Treatment',
        content: `<p>Do not treat frail older adults who are incontinent with BPH medications.</p>
        <p class="evidence-source">STOPPFrail guidelines (<a href="https://academic.oup.com/ageing/article/50/2/465/5913318?login=false" target="_blank" rel="noopener noreferrer">Curtin 2020</a>)</p>`
    },
    'overactive-bladder': {
        title: 'Overactive Bladder',
        content: `<p>Generally, drug treatment should not be used for those who make no attempt to toilet when aided, become agitated with toileting, or are so functionally and cognitively impaired that there is no prospect of meaningful benefit.</p>
        <p class="evidence-source">International Consultation on Incontinence (<a href="https://onlinelibrary.wiley.com/doi/10.1002/nau.24549" target="_blank" rel="noopener noreferrer">Gibson 2020</a>)</p>`
    },
    'antihyperglycemic': {
        title: 'Antihyperglycemic',
        content: `<p>Avoid HbA1C target &lt;7.5% (average 10.1 mmol/L glucose) as it is associated with net harm.</p>
        <p class="evidence-source">STOPPFrail guidelines (<a href="https://academic.oup.com/ageing/article/50/2/465/5913318?login=false" target="_blank" rel="noopener noreferrer">Curtin 2020</a>)</p>`
    },
    'acetaminophen': {
        title: 'Acetaminophen',
        content: `<p>No evidence of improvement in pain.</p>
        <p class="evidence-source">Acetaminophen usage in long-term care (<a href="https://www.jamda.com/article/S1525-8610(25)00239-7/fulltext" target="_blank" rel="noopener noreferrer">Kraut 2025</a>)</p>`
    },
    'melatonin': {
        title: 'Melatonin',
        content: `<p>No evidence it improves any aspect of sleep.</p>
        <p class="evidence-source"><a href="https://www.cda-amc.ca/sites/default/files/pdf/htis/2022/RC1422%20Melatonin%20for%20Insomnia%20Final.pdf" target="_blank" rel="noopener noreferrer">CADTH review</a> (2022)</p>`
    },
    'iron': {
        title: 'Iron',
        content: `<p>Select low-dose iron as it has similar efficacy and fewer adverse effects.</p>
        <p class="evidence-source">Tools for Practice <a href="https://cfpclearn.ca/tfp30/" target="_blank" rel="noopener noreferrer">#30</a> and <a href="https://cfpclearn.ca/tfp284/" target="_blank" rel="noopener noreferrer">#284</a> (2015 and 2021)</p>`
    }
};

// State management
const formData = {
    patientInfo: {},
    medications: {},
    selections: {},
    noReasons: {},
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
    const allowedSexValues = new Set(['Male', 'Female']);
    
    // Check patient info
    if (!formData.patientInfo.roomNumber || !formData.patientInfo.dob || 
        !formData.patientInfo.sex || !formData.patientInfo.physician ||
        !formData.patientInfo.filledOutBy ||
        !formData.patientInfo.regularMeds || !formData.patientInfo.prnMeds) {
        errors.push('Patient information is incomplete. Please fill in all patient details by clicking PATIENT STICKER.');
    }

    const sexValue = (formData.patientInfo.sex || '').trim();
    if (!allowedSexValues.has(sexValue)) {
        errors.push('Please select Sex by clicking PATIENT STICKER.');
    }
    
    // Check all medications have a selection
    for (const med of allMedications) {
        if (!formData.selections[med]) {
            errors.push(`Please select NA, Yes, or No for ${med.replace(/-/g, ' ')}`);
        }
    }

    // Check all "No" selections have a reason
    for (const med of allMedications) {
        if (formData.selections[med] === 'no') {
            const reason = (formData.noReasons?.[med] || '').trim();
            if (!reason) {
                errors.push(`Please provide a reason for selecting No for ${med.replace(/-/g, ' ')}`);
            }
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

function showNoReasonModal(medicationKey) {
    const textarea = document.getElementById('noReasonText');
    if (textarea) {
        textarea.value = formData.noReasons?.[medicationKey] || '';
        // Focus after paint
        setTimeout(() => textarea.focus(), 0);
    }
    const modal = document.getElementById('noReasonModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function clearSelectionForMedication(medicationKey) {
    const row = document.querySelector(`tr[data-medication="${medicationKey}"]`);
    if (row) {
        row.querySelectorAll('.checkbox-cell[data-option]').forEach(c => {
            c.classList.remove('selected');
            c.textContent = '';
        });
    }
    delete formData.selections[medicationKey];
    delete formData.noReasons[medicationKey];
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
        filledOutBy: document.getElementById('filledOutBy').value,
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
            Physician: ${patientInfo.physician}<br>
            By: ${patientInfo.filledOutBy}
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

// References modal (screen-only)
const referencesBtn = document.getElementById('referencesBtn');
if (referencesBtn) {
    referencesBtn.addEventListener('click', function() {
        const referenceSection = document.querySelector('.reference-section');
        const referencesContent = document.getElementById('referencesContent');

        if (referenceSection && referencesContent) {
            referencesContent.innerHTML = referenceSection.innerHTML;
        }

        const modal = document.getElementById('referencesModal');
        if (modal) {
            modal.style.display = 'block';
        }
    });
}

const closeReferences = document.getElementById('closeReferences');
if (closeReferences) {
    closeReferences.addEventListener('click', function() {
        const modal = document.getElementById('referencesModal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
}

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

        // If switching away from "No", ensure the reason won't be submitted
        if (option !== 'no') {
            delete formData.noReasons[medicationKey];
        }
        
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
        } else if (option === 'no') {
            // No other popup required; ask for reason
            showNoReasonModal(medicationKey);
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

    if (currentMedicationRow && currentOption === 'no') {
        showNoReasonModal(currentMedicationRow);
    }
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
        delete formData.noReasons[currentMedicationRow];
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

    if (currentMedicationRow && currentOption === 'no') {
        showNoReasonModal(currentMedicationRow);
    }
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
        delete formData.noReasons[currentMedicationRow];
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

    if (currentMedicationRow && currentOption === 'no') {
        showNoReasonModal(currentMedicationRow);
    }
});

// No-reason modal
const saveNoReasonBtn = document.getElementById('saveNoReason');
if (saveNoReasonBtn) {
    saveNoReasonBtn.addEventListener('click', function() {
        const reason = (document.getElementById('noReasonText')?.value || '').trim();
        if (!reason) {
            alert('Please enter a reason.');
            return;
        }
        if (currentMedicationRow) {
            formData.noReasons[currentMedicationRow] = reason;
        }
        document.getElementById('noReasonModal').style.display = 'none';
    });
}

const cancelNoReasonBtn = document.getElementById('cancelNoReason');
if (cancelNoReasonBtn) {
    cancelNoReasonBtn.addEventListener('click', function() {
        if (currentMedicationRow) {
            clearSelectionForMedication(currentMedicationRow);
        }
        document.getElementById('noReasonModal').style.display = 'none';
    });
}

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
        delete formData.noReasons[currentMedicationRow];
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

    // Helper function to get "No" reason (only when current selection is No)
    const getNoReason = (key) => {
        return formData.selections[key] === 'no' ? (formData.noReasons[key] || '') : '';
    };


    // Formats to 2026-02-01 14:03:22
    const formatDateTimeForSheets = (date) => {
        const pad2 = (n) => String(n).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad2(date.getMonth() + 1);
        const day = pad2(date.getDate());
        const hours = pad2(date.getHours());
        const minutes = pad2(date.getMinutes());
        const seconds = pad2(date.getSeconds());
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    
    // Prepare data in exact CSV column order
    const submissionData = {
        // Room info (columns 1-8)
        roomNumber: formData.patientInfo.roomNumber || '',
        dob: formData.patientInfo.dob || '',
        sex: formData.patientInfo.sex || '',
        physician: formData.patientInfo.physician || '',
        regularMeds: formData.patientInfo.regularMeds || '',
        prnMeds: formData.patientInfo.prnMeds || '',
        filledOutBy: formData.patientInfo.filledOutBy || '',
        date: formatDateTimeForSheets(new Date()),
        
        // Vitamin D (column 9)
        vitaminD: getSelection('vitamin-d'),
        vitaminDNoReason: getNoReason('vitamin-d'),
        
        // Calcium (column 10)
        calcium: getSelection('calcium'),
        calciumNoReason: getNoReason('calcium'),
        
        // Bisphosphonate (columns 11-12)
        bisphosphonate: getSelection('bisphosphonate'),
        bisphosphonateName: getMedName('bisphosphonate'),
        bisphosphonateNoReason: getNoReason('bisphosphonate'),
        
        // Statin (columns 13-14)
        statin: getSelection('statin'),
        statinName: getMedName('statin'),
        statinNoReason: getNoReason('statin'),
        
        // ASA (column 15)
        asa: getSelection('acetylsalicylic-acid'),
        asaNoReason: getNoReason('acetylsalicylic-acid'),
        
        // Antihypertensive (columns 16-17)
        antihypertensive: getSelection('antihypertensive'),
        antihypertensiveName: getMedName('antihypertensive'),
        antihypertensiveNoReason: getNoReason('antihypertensive'),
        
        // Multivitamin (column 18)
        multivitamin: getSelection('multivitamin'),
        multivitaminNoReason: getNoReason('multivitamin'),
        
        // B12 (column 19)
        b12: getSelection('b12'),
        b12NoReason: getNoReason('b12'),
        
        // BPH (columns 20-21)
        bph: getSelection('bph-treatment'),
        bphName: getMedName('bph-treatment'),
        bphNoReason: getNoReason('bph-treatment'),
        
        // Overactive bladder (columns 22-23)
        overactiveBladder: getSelection('overactive-bladder'),
        overactiveBladderName: getMedName('overactive-bladder'),
        overactiveBladderNoReason: getNoReason('overactive-bladder'),
        
        // Antihyperglycemic (columns 24-25)
        antihyperglycemic: getSelection('antihyperglycemic'),
        antihyperglycemicName: getMedName('antihyperglycemic'),
        antihyperglycemicNoReason: getNoReason('antihyperglycemic'),
        
        // Acetaminophen (column 26)
        acetaminophen: getSelection('acetaminophen'),
        acetaminophenDose: formData.medications['acetaminophen']?.dose || '',
        acetaminophenFrequency: formData.medications['acetaminophen']?.frequency || '',
        acetaminophenNoReason: getNoReason('acetaminophen'),
        
        // Melatonin (column 27)
        melatonin: getSelection('melatonin'),
        melatoninNoReason: getNoReason('melatonin'),
        
        // Iron (column 28)
        iron: getSelection('iron'),
        ironName: formData.medications['iron']?.name || '',
        ironFrequency: formData.medications['iron']?.frequency || '',
        ironNoReason: getNoReason('iron'),
        
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