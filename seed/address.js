// seed/address.js
export const tableName = 'address';

export const tableSchema = `
CREATE TABLE IF NOT EXISTS address (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    delivery_025 DECIMAL(10, 2) DEFAULT null,
    delivery_050_100 DECIMAL(10, 2) DEFAULT null,
    delivery_max DECIMAL(10, 2) DEFAULT null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const seedData = [
  {
    name: '102 Reddiyur',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'A1 City',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Alangayam',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Alasanthapuram',
    delivery_025: null,
    delivery_050_100: 1400,
    delivery_max: 800
  },
  {
    name: 'Ambalur',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Ambur Pettai',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Andiyappanur',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Armanibenta',
    delivery_025: null,
    delivery_050_100: 2200,
    delivery_max: 1600
  },
  {
    name: 'Asanampattu',
    delivery_025: null,
    delivery_050_100: 1500,
    delivery_max: 1100
  },
  {
    name: 'Avaranguppam',
    delivery_025: null,
    delivery_050_100: 1400,
    delivery_max: 900
  },
  {
    name: 'Bakirthaka',
    delivery_025: null,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Balapanur',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Bankoor',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Basheerabad',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Bethavepampattu',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 500
  },
  {
    name: 'Bethur',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Chekumedu',
    delivery_025: 300,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Chennampettai',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Chetiyapanur',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Chikanankuppam',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Chinnakalupalli',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Chinnamottur',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'CV Patrai',
    delivery_025: 500,
    delivery_050_100: 600,
    delivery_max: 500
  },
  {
    name: 'Echangal',
    delivery_025: 600,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Eklaspuram',
    delivery_025: 600,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Ezhalaraipatti',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Giri Samuthiram',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Goundappanur',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Gunreddyor',
    delivery_025: 600,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Idayampallam',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Ilayanagaram',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Indra Nagar',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Irunapattu',
    delivery_025: 1000,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Jabrabad',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Jalthi',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Jampallam',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Jamunamathur',
    delivery_025: null,
    delivery_050_100: 2500,
    delivery_max: 1600
  },
  {
    name: 'Janathapuram',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Jolarpet',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Kaburabad',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Kacheri Road',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Kadharpet',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Kalendira',
    delivery_025: 500,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Kallupalli',
    delivery_025: 500,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Kalrapatti',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Kamal Kuttai',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Kambangudi Malai',
    delivery_025: null,
    delivery_050_100: 3500,
    delivery_max: 300
  },
  {
    name: 'Kammiyampattu',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Kanavaipudhur',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Karimabad',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Katteri',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Kavalur',
    delivery_025: null,
    delivery_050_100: 1600,
    delivery_max: 1100
  },
  {
    name: 'Kaveripattu',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Kethanndapaatti',
    delivery_025: null,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Kizhulur',
    delivery_025: null,
    delivery_050_100: 700,
    delivery_max: 450
  },
  {
    name: 'KK Kottai',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 450
  },
  {
    name: 'KK Theru',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Kodayanji',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Kodiyoor (Konambatti)',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Konamedu',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Konnampatti',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Kootroad (konambatti)',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Kooval Kuttai',
    delivery_025: 500,
    delivery_050_100: 600,
    delivery_max: 450
  },
  {
    name: 'Krishnavaram (kursilapattu)',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Kunnathur',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Kurisilapattu',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Kurumbatheru',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Kurumpatti (mittur)',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Lakshmipuram',
    delivery_025: 1000,
    delivery_050_100: 1400,
    delivery_max: 800
  },
  {
    name: 'Lalayeri',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Madanancheri',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Madapalli',
    delivery_025: null,
    delivery_050_100: 1500,
    delivery_max: 800
  },
  {
    name: 'Madavalam',
    delivery_025: null,
    delivery_050_100: 1500,
    delivery_max: 800
  },
  {
    name: 'Malai Rediyor',
    delivery_025: null,
    delivery_050_100: 1600,
    delivery_max: 1100
  },
  {
    name: 'Mallagunda',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Mallakuppam',
    delivery_025: null,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Mandalavadi',
    delivery_025: 600,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Mandharakuttai',
    delivery_025: null,
    delivery_050_100: 1600,
    delivery_max: 1100
  },
  {
    name: 'Mankamarathupallam',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Marimani Kuppam',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Mayil Paarai',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Mel Nimmiyampattu',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Metupalayam',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Mitnanguppam',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Mittur',
    delivery_025: 700,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Mullai',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 500
  },
  {
    name: 'Nekkunthi',
    delivery_025: 500,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Naneri',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 500
  },
  {
    name: 'Narasingapuram',
    delivery_025: 800,
    delivery_050_100: 900,
    delivery_max: 600
  },
  {
    name: 'Narayanapuram',
    delivery_025: 1000,
    delivery_050_100: 1400,
    delivery_max: 800
  },
  {
    name: 'Natrampalli',
    delivery_025: 1000,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Nethaji Nagar',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Newtown',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Nimmiyampattu',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Old Vaniyambadi',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 450
  },
  {
    name: 'Omakuppam',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Paapaneri',
    delivery_025: 300,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Pachur (natrampalli)',
    delivery_025: 1000,
    delivery_050_100: 1500,
    delivery_max: 900
  },
  {
    name: 'Pallipattu',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Papanoor Medu',
    delivery_025: null,
    delivery_050_100: 1400,
    delivery_max: 800
  },
  {
    name: 'Pasalikuttai',
    delivery_025: null,
    delivery_050_100: 1500,
    delivery_max: 800
  },
  {
    name: 'Patha Pettai',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 500
  },
  {
    name: 'Periya Vellakuttai',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Peranampattu',
    delivery_025: null,
    delivery_050_100: 1500,
    delivery_max: 900
  },
  {
    name: 'Perumalpettai',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Perumapattu',
    delivery_025: null,
    delivery_050_100: 1500,
    delivery_max: 800
  },
  {
    name: 'Ponneri',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Poomaram',
    delivery_025: 600,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Poongulam',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 800
  },
  {
    name: 'Pudhur Vnb',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Pudupettai',
    delivery_025: 1000,
    delivery_050_100: 1500,
    delivery_max: 900
  },
  {
    name: 'Pudurnadu',
    delivery_025: null,
    delivery_050_100: 2600,
    delivery_max: null
  },
  {
    name: 'Pulavar Palli',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Pullakuttai',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 450
  },
  {
    name: 'Puthukovil',
    delivery_025: 800,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Ramanayakanpettai',
    delivery_025: 1000,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Ranipettai',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 500
  },
  {
    name: 'Reddyvalasai',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Rms Pudur',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Sankarapuram',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Sathiram',
    delivery_025: null,
    delivery_050_100: 1600,
    delivery_max: 1100
  },
  {
    name: 'Sennampettai',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Shakirabad',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Sorkalnatham',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Sugarmill',
    delivery_025: null,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Sunnambu Pallam',
    delivery_025: 500,
    delivery_050_100: 600,
    delivery_max: 450
  },
  {
    name: 'Thamanerimuthur',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Thekkupattu',
    delivery_025: 800,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Thimanur',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Thimmampettai',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Thiriyalam',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Thumberi',
    delivery_025: 1000,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Tirupathur',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Utheynthiram',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Vadacheri',
    delivery_025: 600,
    delivery_050_100: 700,
    delivery_max: 500
  },
  {
    name: 'Vadakkupattu',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Valayampattu',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Vallipattu',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Vaniyambadi',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Velathigamanibenta',
    delivery_025: null,
    delivery_050_100: 2200,
    delivery_max: 1600
  },
  {
    name: 'Vellakkal',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 450
  },
  {
    name: 'Vellakuttai',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Vengalapuram',
    delivery_025: null,
    delivery_050_100: 1500,
    delivery_max: 800
  },
  {
    name: 'Vengatarajapuram',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 800
  },
  {
    name: 'Vengayapalli',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Vepalampatti',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Vepamarasalai',
    delivery_025: 300,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Vepamatta Yeri',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Veppampattu',
    delivery_025: 500,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Vijilapuram',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Yelagiri',
    delivery_025: null,
    delivery_050_100: 2500,
    delivery_max: 1600
  },
  {
    name: 'Thirumanjolai',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Kaja Nagar',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Sunnambukar Theru',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Samanthi Kuppam',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Koodapattu',
    delivery_025: null,
    delivery_050_100: 1500,
    delivery_max: 800
  },
  {
    name: 'Marapattu',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Kuvalkuttai',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 900
  },
  {
    name: 'Jeeva Nagar',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 800
  },
  {
    name: 'Chettikuttai',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Palnanguppam',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Ambur',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Marati Palayam',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 450
  },
  {
    name: 'Kurumpatti (Vallipattu)',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Kudapattu',
    delivery_025: null,
    delivery_050_100: 1400,
    delivery_max: 800
  },
  {
    name: 'Jangalapuram',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Nayakkanur',
    delivery_025: null,
    delivery_050_100: 1600,
    delivery_max: 1100
  },
  {
    name: 'Periya Motur',
    delivery_025: null,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'A Kotavoor',
    delivery_025: null,
    delivery_050_100: 1600,
    delivery_max: 1000
  },
  {
    name: 'Kullapannur',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Vasanthapuram',
    delivery_025: null,
    delivery_050_100: 2000,
    delivery_max: 1500
  },
  {
    name: 'Kunthanimedu',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Arapandakuppam',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Kottai',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 800
  },
  {
    name: 'Kaukapattu',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Periya Pattai',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Vinnamangalam',
    delivery_025: 600,
    delivery_050_100: 800,
    delivery_max: 500
  },
  {
    name: 'Alangayam(Pudhur)',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 650
  },
  {
    name: 'Vetuvanam',
    delivery_025: null,
    delivery_050_100: 3000,
    delivery_max: 2000
  },
  {
    name: 'Katambur',
    delivery_025: null,
    delivery_050_100: 1600,
    delivery_max: 2000
  },
  {
    name: 'Korate',
    delivery_025: null,
    delivery_050_100: 1600,
    delivery_max: 850
  },
  {
    name: 'Thuthipattu',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'Matha Kadappa',
    delivery_025: null,
    delivery_050_100: 2200,
    delivery_max: 1600
  },
  {
    name: 'Thurinji Kuppam',
    delivery_025: 400,
    delivery_050_100: 600,
    delivery_max: 450
  },
  {
    name: 'Perampattu',
    delivery_025: null,
    delivery_050_100: 1500,
    delivery_max: 1000
  },
  {
    name: 'Paravakutti',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 1400
  },
  {
    name: 'Samuthiram',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 1400
  },
  {
    name: 'Kadambur',
    delivery_025: 1200,
    delivery_050_100: 1200,
    delivery_max: 800
  },
  {
    name: 'Balpanatham',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 700
  },
  {
    name: 'NaduPatrai',
    delivery_025: 500,
    delivery_050_100: 600,
    delivery_max: 500
  },
  {
    name: 'Savlour',
    delivery_025: null,
    delivery_050_100: 1200,
    delivery_max: 800
  },
  {
    name: 'Alingikulam',
    delivery_025: 500,
    delivery_050_100: 800,
    delivery_max: 600
  },
  {
    name: 'Thigapalaiyam',
    delivery_025: 800,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Kudiyana Kuppam',
    delivery_025: null,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'Sikaranapalli',
    delivery_025: null,
    delivery_050_100: 1000,
    delivery_max: 600
  },
  {
    name: 'KodumamPalli',
    delivery_025: null,
    delivery_050_100: 1500,
    delivery_max: 1000
  },
  {
    name: 'Salamabad',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Ikbal Road',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  },
  {
    name: 'Thora Yari',
    delivery_025: 400,
    delivery_050_100: 500,
    delivery_max: 400
  }
];
