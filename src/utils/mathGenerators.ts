import { KumonLevelId, Question } from '../types';

export function getStepByStepSolutionForQuestion(levelId: KumonLevelId, q: Partial<Question>): string[] {
  const ans = q.correctAnswer || '';
  const formula = q.mathFormula || q.prompt || '';

  switch (levelId) {
    case '6A': {
      const count = q.visualItems?.count || parseInt(ans, 10) || 1;
      return [
        'Langkah 1: Amati seluruh susunan titik/objek dari posisi paling kiri ke kanan.',
        `Langkah 2: Lakukan pembilangan teratur secara berurutan: ${Array.from({ length: Math.min(count, 5) }, (_, i) => i + 1).join(', ')}${count > 5 ? `, ..., ${count}` : ''}.`,
        `Langkah 3: Jumlah total objek yang terhitung secara tepat adalah ${count}.`,
        `Jawaban Akhir: ${ans}`
      ];
    }

    case '5A': {
      return [
        'Langkah 1: Perhatikan pola deret bilangan yang selalu bertambah 1 (+1) pada setiap langkah.',
        'Langkah 2: Amati nilai suku sebelum atau sesudah kotak yang kosong pada deret.',
        `Langkah 3: Tentukan suku yang hilang dengan melengkapi urutan bilangan bulat teratur.`,
        `Jawaban Akhir: ${ans}`
      ];
    }

    case '4A': {
      return [
        'Langkah 1: Pahami konsep dasar operasi penambahan 1 (+1) sebagai pencarian bilangan penerus langsung.',
        `Langkah 2: Bilangan bulat tepat setelah suku awal pada garis bilangan adalah ${ans}.`,
        `Jawaban Akhir: ${ans}`
      ];
    }

    case '3A': {
      return [
        'Langkah 1: Identifikasi suku pertama dan suku penambah pada soal penjumlahan.',
        'Langkah 2: Gunakan strategi membilang maju atau pengelompokan satuan dengan cermat.',
        `Langkah 3: Jumlahkan kedua bilangan untuk mendapatkan nilai total.`,
        `Jawaban Akhir: ${ans}`
      ];
    }

    case '2A': {
      if (q.prompt?.toLowerCase().includes('kurang') || formula.includes('-')) {
        return [
          'Langkah 1: Perhatikan operasi pengurangan pada bilangan yang diberikan.',
          'Langkah 2: Hitung mundur dari bilangan yang dikurangi sebesar nilai pengurangnya.',
          `Langkah 3: Uji kebenaran hasil: (${ans}) + (pengurang) = (bilangan mula-mula).`,
          `Jawaban Akhir: ${ans}`
        ];
      }
      return [
        'Langkah 1: Identifikasi suku-suku yang dijumlahkan (+6 s.d +10).',
        'Langkah 2: Gunakan teknik pelengkap 10 (genapkan suku pertama ke 10, lalu tambahkan sisa satuan).',
        `Langkah 3: Gabungkan hasil puluhan dan satuan secara tepat.`,
        `Jawaban Akhir: ${ans}`
      ];
    }

    case 'A': {
      if (q.prompt?.toLowerCase().includes('kurang') || formula.includes('-')) {
        return [
          'Langkah 1: Uraikan kedua bilangan menurut nilai tempat (puluhan dan satuan).',
          'Langkah 2: Kurangkan nilai tempat puluhan, lalu kurangkan nilai tempat satuan.',
          'Langkah 3: Gabungkan selisih puluhan dan satuan untuk mendapatkan hasil akhir.',
          `Jawaban Akhir: ${ans}`
        ];
      }
      return [
        'Langkah 1: Pisahkan bilangan mendatar menurut nilai tempat puluhan dan satuan.',
        'Langkah 2: Jumlahkan bagian puluhan, kemudian jumlahkan bagian satuan.',
        'Langkah 3: Jumlahkan kedua hasil nilai tempat untuk memperoleh nilai akhir.',
        `Jawaban Akhir: ${ans}`
      ];
    }

    case 'B': {
      if (formula.includes('-')) {
        return [
          'Langkah 1: Susun bilangan sejajar lurus ke bawah berdasarkan kolom ratusan, puluhan, dan satuan.',
          'Langkah 2: Hitung kolom satuan: jika angka atas lebih kecil, pinjam 1 puluhan (10) dari kolom di sebelah kirinya.',
          'Langkah 3: Lanjutkan pengurangan pada kolom puluhan dan ratusan secara berurutan.',
          `Jawaban Akhir: ${ans}`
        ];
      }
      return [
        'Langkah 1: Susun bilangan sejajar vertikal lurus pada kolom nilai tempat.',
        'Langkah 2: Hitung kolom satuan terlebih dahulu: jika hasil ≥ 10, simpan nilai puluhan ke kolom kiri.',
        'Langkah 3: Jumlahkan kolom puluhan dan ratusan beserta simpanan angka sebelumnya.',
        `Jawaban Akhir: ${ans}`
      ];
    }

    case 'C': {
      if (formula.includes('\\div') || formula.includes('÷')) {
        return [
          'Langkah 1: Terapkan konsep pembagian sebagai operasi kebalikan dari perkalian dasar.',
          `Langkah 2: Cari bilangan pengali yang memenuhi: (pembagi) × (${ans}) = (bilangan yang dibagi).`,
          `Langkah 3: Tuliskan hasil bagi secara tepat sesuai tabel perkalian.`,
          `Jawaban Akhir: ${ans}`
        ];
      }
      return [
        'Langkah 1: Terapkan konsep perkalian dasar sebagai bentuk penjumlahan berulang.',
        'Langkah 2: Gunakan tabel hafalan perkalian dasar untuk menghitung hasil kali suku-suku.',
        `Langkah 3: Periksa hasil kali kedua bilangan secara teliti.`,
        `Jawaban Akhir: ${ans}`
      ];
    }

    case 'D': {
      if (q.prompt?.toLowerCase().includes('sederhana') || formula.includes('\\frac')) {
        return [
          'Langkah 1: Tentukan Faktor Persekutuan Terbesar (FPB) dari pembilang dan penyebut.',
          'Langkah 2: Bagi kedua bilangan (pembilang dan penyebut) dengan nilai FPB yang sama.',
          `Langkah 3: Tuliskan pecahan dalam bentuk paling sederhana (irreducible fraction).`,
          `Jawaban Akhir: ${ans}`
        ];
      }
      if (q.prompt?.toLowerCase().includes('sisa') || formula.includes('\\div')) {
        return [
          'Langkah 1: Lakukan pembagian bersusun dari angka bernilai tempat tertinggi.',
          'Langkah 2: Kalikan hasil bagi sementara dengan pembagi, lalu kurangkan untuk mencari sisa pembagian.',
          `Langkah 3: Nyatakan hasil bagi bulat beserta nilai sisa yang diperoleh.`,
          `Jawaban Akhir: ${ans}`
        ];
      }
      return [
        'Langkah 1: Lakukan perkalian bersusun 2 digit dengan mengalikan digit satuan terlebih dahulu.',
        'Langkah 2: Kalikan digit puluhan dan tempatkan hasilnya bergeser 1 posisi ke kiri.',
        'Langkah 3: Jumlahkan hasil kali parsial untuk memperoleh hasil kali total.',
        `Jawaban Akhir: ${ans}`
      ];
    }

    case 'E': {
      if (formula.includes('\\times') || formula.includes('×')) {
        return [
          'Langkah 1: Kalikan bagian pembilang dengan pembilang: (pembilang₁ × pembilang₂).',
          'Langkah 2: Kalikan bagian penyebut dengan penyebut: (penyebut₁ × penyebut₂).',
          'Langkah 3: Sederhanakan pecahan ke bentuk paling sederhana bila pembilang dan penyebut memiliki faktor persekutuan.',
          `Jawaban Akhir: ${ans}`
        ];
      }
      return [
        'Langkah 1: Cari Kelipatan Persekutuan Terkecil (KPK) dari penyebut kedua pecahan untuk menyamakan penyebut.',
        'Langkah 2: Ubah masing-masing pecahan ke bentuk pecahan senilai berpenyebut KPK tersebut.',
        'Langkah 3: Operasikan bagian pembilang (tambah/kurang) dan pertahankan penyebut yang telah disamakan.',
        'Langkah 4: Sederhanakan hasil pecahan akhir bila memungkinkan.',
        `Jawaban Akhir: ${ans}`
      ];
    }

    case 'F': {
      return [
        'Langkah 1 (Hierarki KABATAKU): Periksa tanda kurung terlebih dahulu jika ada.',
        'Langkah 2: Dahulukan operasi perkalian (×) dan pembagian (÷) sebelum operasi penjumlahan atau pengurangan.',
        'Langkah 3: Lakukan operasi penjumlahan (+) dan pengurangan (-) secara berurutan dari kiri ke kanan.',
        `Jawaban Akhir: ${ans}`
      ];
    }

    case 'G': {
      if (formula.includes('x')) {
        return [
          'Langkah 1: Tuliskan persamaan linear dan pisahkan suku bervariabel di ruas kiri dan konstanta di ruas kanan.',
          'Langkah 2: Kurangkan konstanta pada kedua ruas untuk mengisolasi suku bervariabel.',
          'Langkah 3: Bagi kedua ruas dengan koefisien variabel x untuk mendapatkan nilai x.',
          `Jawaban Akhir: x = ${ans}`
        ];
      }
      return [
        'Langkah 1: Perhatikan tanda positif (+) dan negatif (-) pada setiap bilangan bulat.',
        'Langkah 2: Ingat aturan tanda perkalian: (-) × (+) = (-) dan (-) × (-) = (+).',
        'Langkah 3: Kalikan nilai mutlak bilangan dan cantumkan tanda yang sesuai.',
        `Jawaban Akhir: ${ans}`
      ];
    }

    case 'H': {
      return [
        'Langkah 1 (Eliminasi): Samakan koefisien salah satu variabel, lalu kurangkan atau jumlahkan kedua persamaan untuk mengeliminasi variabel tersebut.',
        'Langkah 2: Selesaikan persamaan linear 1 variabel yang tersisa untuk memperoleh nilai variabel pertama.',
        'Langkah 3 (Substitusi): Masukkan nilai variabel pertama ke salah satu persamaan asal untuk mencari nilai variabel kedua.',
        `Langkah 4: Tuliskan pasangan penyelesaian (x, y) secara terurut.`,
        `Jawaban Akhir: (x, y) = (${ans})`
      ];
    }

    case 'I': {
      return [
        'Langkah 1: Pastikan persamaan kuadrat berada dalam bentuk baku ax² + bx + c = 0.',
        'Langkah 2: Tentukan dua bilangan p dan q sehingga p × q = c dan p + q = b.',
        'Langkah 3: Faktorkan persamaan menjadi bentuk perkalian faktor: (x - p)(x - q) = 0.',
        'Langkah 4: Tentukan akar-akar penyelesaian dengan menyamakan setiap faktor dengan nol (x = p atau x = q).',
        `Jawaban Akhir: x = ${ans}`
      ];
    }

    case 'J': {
      return [
        'Langkah 1 (Teorema Sisa): Jika polinomial P(x) dibagi oleh (x - k), maka sisa pembagian adalah S = P(k).',
        'Langkah 2: Tentukan pembuat nol pembagi: x - k = 0 ⟹ x = k.',
        'Langkah 3: Substitusikan nilai x = k ke setiap suku pada fungsi suku banyak P(x).',
        'Langkah 4: Hitung nilai perpangkatan dan perkalian aljabar secara teliti hingga didapat nilai sisa.',
        `Jawaban Akhir: Sisa = ${ans}`
      ];
    }

    case 'K': {
      return [
        'Langkah 1: Gunakan definisi logaritma: log_b(a) = x ⟺ b^x = a.',
        'Langkah 2: Nyatakan numerus (a) sebagai bilangan berpangkat dengan bilangan pokok/basis yang sama (b).',
        'Langkah 3: Samakan nilai eksponen/pangkat pada kedua ruas untuk menemukan nilai x.',
        `Jawaban Akhir: x = ${ans}`
      ];
    }

    case 'L': {
      return [
        'Langkah 1 (Aturan Turunan Fungsi Pangkat): Rumus umum turunan f(x) = a·x^n adalah f\'(x) = a · n · x^(n - 1).',
        'Langkah 2: Kalikan koefisien (a) dengan pangkat mula-mula (n).',
        'Langkah 3: Kurangi pangkat variabel x sebanyak 1 unit (n - 1).',
        `Langkah 4: Tuliskan bentuk turunan pertama f'(x) secara rapi.`,
        `Jawaban Akhir: f'(x) = ${ans}`
      ];
    }

    case 'M': {
      return [
        'Langkah 1: Tentukan fungsi antiturunan f(x) dengan aturan integral tak tentu: ∫ a·x^n dx = (a / (n + 1)) · x^(n + 1).',
        'Langkah 2: Terapkan Teorema Dasar Kalkulus untuk integral tentu: ∫_a^b f(x) dx = [F(x)]_a^b = F(b) - F(a).',
        'Langkah 3: Evaluasi nilai fungsi antiturunan pada batas atas (b) dan batas bawah (a).',
        'Langkah 4: Kurangkan nilai F(b) dengan F(a) untuk memperoleh nilai integral tentu.',
        `Jawaban Akhir: ${ans}`
      ];
    }

    default:
      return [
        'Langkah 1: Identifikasi konsep matematika dan formula yang diberikan pada soal.',
        'Langkah 2: Selesaikan perhitungan langkah demi langkah secara sistematis.',
        `Jawaban Akhir: ${ans}`
      ];
  }
}

export function generateWorksheetQuestions(levelId: KumonLevelId, worksheetNum: number): Question[] {
  const questions: Question[] = [];
  const seed = (worksheetNum - 1) * 10;

  for (let i = 1; i <= 10; i++) {
    const qNum = i;
    const qId = `${levelId}-w${worksheetNum}-q${i}`;

    switch (levelId) {
      case '6A': {
        // Counting 1-10, visual dots and number recognition
        const count = ((seed + i) % 10) + 1;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: `Hitunglah berapa banyak objek/titik berikut ini:`,
          visualItems: {
            type: 'dots',
            count
          },
          options: [
            `${Math.max(1, count - 1)}`,
            `${count}`,
            `${count + 1}`,
            `${count + 2}`
          ].sort(() => 0.5 - Math.random()),
          correctAnswer: `${count}`,
          explanation: `Ada tepat ${count} buah titik jika dihitung satu per satu.`
        });
        break;
      }

      case '5A': {
        // Number sequences 1-50, missing numbers
        const base = (worksheetNum * 4 + i * 2) % 42 + 2;
        const missingPos = i % 3; // 0: first, 1: mid, 2: last
        let formula = '';
        let ans = '';

        if (missingPos === 0) {
          formula = `\\underline{\\quad}, \\; ${base + 1}, \\; ${base + 2}, \\; ${base + 3}`;
          ans = `${base}`;
        } else if (missingPos === 1) {
          formula = `${base}, \\; \\underline{\\quad}, \\; ${base + 2}, \\; ${base + 3}`;
          ans = `${base + 1}`;
        } else {
          formula = `${base}, \\; ${base + 1}, \\; \\underline{\\quad}, \\; ${base + 3}`;
          ans = `${base + 2}`;
        }

        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: `Isilah bilangan yang hilang pada deret bilangan berikut:`,
          mathFormula: formula,
          isLatex: true,
          correctAnswer: ans,
          explanation: `Urutan bilangan maju teratur bertambah 1 (+1), sehingga bilangan pengisi yang tepat adalah ${ans}.`
        });
        break;
      }

      case '4A': {
        // Numbers up to 100 & +1 concept
        const a = (worksheetNum * 9 + i * 7) % 98 + 1;
        const ans = a + 1;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: `Berapakah hasil penjumlahan bilangan berikut:`,
          mathFormula: `${a} + 1 = \\dots`,
          isLatex: true,
          correctAnswer: `${ans}`,
          explanation: `Konsep penambahan 1: bilangan bulat tepat setelah ${a} adalah ${ans}.`
        });
        break;
      }

      case '3A': {
        // Basic additions (+1 to +5)
        const addend = ((i + worksheetNum) % 5) + 1;
        const a = (worksheetNum * 2 + i * 3) % 15 + 1;
        const ans = a + addend;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: `Berapakah hasil penjumlahan bilangan berikut:`,
          mathFormula: `${a} + ${addend} = \\dots`,
          isLatex: true,
          correctAnswer: `${ans}`,
          explanation: `${a} + ${addend} = ${ans}.`
        });
        break;
      }

      case '2A': {
        // Additions (+6 to +10) or Subtractions (-1 to -5)
        const isSubtraction = i % 2 === 0;
        if (isSubtraction) {
          const sub = ((i + worksheetNum) % 5) + 1;
          const a = sub + (i % 10) + 2;
          const ans = a - sub;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Berapakah hasil pengurangan bilangan berikut:`,
            mathFormula: `${a} - ${sub} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} - ${sub} = ${ans} (karena ${ans} + ${sub} = ${a}).`
          });
        } else {
          const add = ((i + worksheetNum) % 5) + 6;
          const a = (i * 2 + worksheetNum) % 12 + 1;
          const ans = a + add;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Berapakah hasil penjumlahan bilangan berikut:`,
            mathFormula: `${a} + ${add} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} + ${add} = ${ans}.`
          });
        }
        break;
      }

      case 'A': {
        // Horizontal Addition & Subtraction (2-digit)
        const isSub = i % 2 === 0;
        if (isSub) {
          const a = (worksheetNum * 7 + i * 8) % 70 + 25;
          const b = (i * 3 + worksheetNum * 2) % 20 + 7;
          const ans = a - b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Berapakah hasil pengurangan mendatar berikut:`,
            mathFormula: `${a} - ${b} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} - ${b} = ${ans}.`
          });
        } else {
          const a = (worksheetNum * 6 + i * 5) % 45 + 15;
          const b = (i * 4 + worksheetNum * 3) % 40 + 12;
          const ans = a + b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Berapakah hasil penjumlahan mendatar berikut:`,
            mathFormula: `${a} + ${b} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} + ${b} = ${ans}.`
          });
        }
        break;
      }

      case 'B': {
        // Vertical addition with carrying / subtraction with borrowing
        const isSub = i % 2 === 0;
        if (isSub) {
          const a = (worksheetNum * 25 + i * 37) % 600 + 250;
          const b = (i * 19 + worksheetNum * 14) % 200 + 75;
          const ans = a - b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Hitunglah pengurangan bersusun berikut:`,
            mathFormula: `\\begin{array}{rr} & ${a} \\\\[2pt] - & ${b} \\\\[2pt] \\hline \\end{array}`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `Pengurangan bersusun dengan teknik meminjam: ${a} - ${b} = ${ans}.`
          });
        } else {
          const a = (worksheetNum * 33 + i * 29) % 550 + 180;
          const b = (i * 27 + worksheetNum * 19) % 400 + 145;
          const ans = a + b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Hitunglah penjumlahan bersusun berikut:`,
            mathFormula: `\\begin{array}{rr} & ${a} \\\\[2pt] + & ${b} \\\\[2pt] \\hline \\end{array}`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `Penjumlahan bersusun dengan teknik menyimpan: ${a} + ${b} = ${ans}.`
          });
        }
        break;
      }

      case 'C': {
        // Multiplication table 1-9 & basic division
        const isDiv = i % 2 === 0;
        if (isDiv) {
          const b = ((i + worksheetNum) % 8) + 2;
          const quotient = ((i * 3 + worksheetNum) % 8) + 2;
          const a = b * quotient;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Hitunglah pembagian bilangan berikut:`,
            mathFormula: `${a} \\div ${b} = \\dots`,
            isLatex: true,
            correctAnswer: `${quotient}`,
            explanation: `${a} ÷ ${b} = ${quotient} (karena ${b} × ${quotient} = ${a}).`
          });
        } else {
          const a = ((i + worksheetNum * 2) % 8) + 2;
          const b = ((i * 3 + worksheetNum) % 8) + 2;
          const ans = a * b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Hitunglah perkalian bilangan berikut:`,
            mathFormula: `${a} \\times ${b} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} × ${b} = ${ans}.`
          });
        }
        break;
      }

      case 'D': {
        // Long multiplication / division with remainders & fraction simplification
        if (i % 3 === 1) {
          // 2 digit × 2 digit
          const a = (i * 7 + worksheetNum * 4) % 60 + 20;
          const b = (i * 5 + worksheetNum * 3) % 40 + 12;
          const ans = a * b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Hitunglah perkalian bilangan berikut:',
            mathFormula: `${a} \\times ${b} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} × ${b} = ${ans}.`
          });
        } else if (i % 3 === 2) {
          // Division with remainder
          const divisor = ((i + worksheetNum) % 7) + 3;
          const q = (i * 4 + worksheetNum * 6) % 30 + 10;
          const rem = (i % (divisor - 1)) + 1;
          const dividend = divisor * q + rem;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Hitunglah hasil bagi dan sisa dari pembagian berikut (contoh format: ${q} sisa ${rem}):`,
            mathFormula: `${dividend} \\div ${divisor} = \\dots`,
            isLatex: true,
            correctAnswer: `${q} sisa ${rem}`,
            acceptableAnswers: [`${q} sisa ${rem}`, `${q}r${rem}`, `${q} sisa: ${rem}`],
            explanation: `Berdasarkan algoritma pembagian: ${dividend} = (${divisor} × ${q}) + ${rem}. Jadi hasilnya ${q} dengan sisa ${rem}.`
          });
        } else {
          // Simplify fraction
          const factor = ((i + worksheetNum) % 4) + 2;
          const num = ((i * 2 + worksheetNum) % 5) + 1;
          const den = num + ((i + 1) % 4) + 1;
          const bigNum = num * factor;
          const bigDen = den * factor;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Sederhanakan bentuk pecahan berikut ke bentuk paling sederhana (contoh jawaban: 2/3):',
            mathFormula: `\\frac{${bigNum}}{${bigDen}} = \\dots`,
            isLatex: true,
            correctAnswer: `${num}/${den}`,
            acceptableAnswers: [`${num}/${den}`, `\\frac{${num}}{${den}}`],
            explanation: `Bagi pembilang dan penyebut dengan FPB keduanya (${factor}): (${bigNum} ÷ ${factor}) / (${bigDen} ÷ ${factor}) = ${num}/${den}.`
          });
        }
        break;
      }

      case 'E': {
        // Operations on Fractions
        const d1 = ((i + worksheetNum) % 4) + 2;
        const d2 = ((i * 2 + worksheetNum) % 3) + 3;
        const n1 = 1;
        const n2 = 1;

        if (i % 2 === 1) {
          // Addition
          const lcm = d1 === d2 ? d1 : d1 * d2;
          const resNum = (n1 * (lcm / d1)) + (n2 * (lcm / d2));
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Hitunglah penjumlahan pecahan berikut (contoh jawaban: 5/6):',
            mathFormula: `\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}} = \\dots`,
            isLatex: true,
            correctAnswer: `${resNum}/${lcm}`,
            acceptableAnswers: [`${resNum}/${lcm}`, `\\frac{${resNum}}{${lcm}}`],
            explanation: `Samakan penyebut ke KPK (${lcm}): ${n1 * (lcm / d1)}/${lcm} + ${n2 * (lcm / d2)}/${lcm} = ${resNum}/${lcm}.`
          });
        } else {
          // Multiplication
          const resNum = n1 * n2 * 2;
          const resDen = d1 * d2;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Hitunglah perkalian pecahan berikut:',
            mathFormula: `\\frac{2}{${d1}} \\times \\frac{1}{${d2}} = \\dots`,
            isLatex: true,
            correctAnswer: `${resNum}/${resDen}`,
            acceptableAnswers: [`${resNum}/${resDen}`, `\\frac{${resNum}}{${resDen}}`],
            explanation: `Kalikan pembilang dengan pembilang dan penyebut dengan penyebut: (2 × 1) / (${d1} × ${d2}) = ${resNum}/${resDen}.`
          });
        }
        break;
      }

      case 'F': {
        // Mixed operations, decimals & BODMAS
        const a = (i * 3 + worksheetNum) % 20 + 10;
        const b = ((i + worksheetNum) % 4) + 2;
        const c = ((i * 2 + worksheetNum) % 5) + 3;
        const ans = a + (b * c);
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Hitunglah hasil urutan operasi campuran berikut:',
          mathFormula: `${a} + ${b} \\times ${c} = \\dots`,
          isLatex: true,
          correctAnswer: `${ans}`,
          explanation: `Sesuai aturan urutan operasi (KABATAKU), perkalian dikerjakan terlebih dahulu: ${b} × ${c} = ${b * c}, lalu ${a} + ${b * c} = ${ans}.`
        });
        break;
      }

      case 'G': {
        // Signed integers & 1-variable linear equations
        if (i % 2 === 1) {
          const a = -((i * 3 + worksheetNum) % 8 + 2);
          const b = ((i * 2 + worksheetNum) % 9 + 3);
          const ans = a * b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Hitunglah perkalian bilangan bulat bertanda berikut:',
            mathFormula: `(${a}) \\times (${b}) = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `Bilangan negatif dikali bilangan positif menghasilkan negatif: (${a}) × (${b}) = ${ans}.`
          });
        } else {
          const coeff = ((i + worksheetNum) % 3) + 2;
          const xVal = ((i * 2 + worksheetNum) % 7) + 1;
          const constVal = ((i * 3 + worksheetNum) % 10) + 3;
          const rhs = coeff * xVal + constVal;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Tentukan nilai x dari persamaan linear berikut:',
            mathFormula: `${coeff}x + ${constVal} = ${rhs}`,
            isLatex: true,
            correctAnswer: `${xVal}`,
            acceptableAnswers: [`${xVal}`, `x=${xVal}`, `x = ${xVal}`],
            explanation: `${coeff}x = ${rhs} - ${constVal} ⟹ ${coeff}x = ${coeff * xVal} ⟹ x = ${coeff * xVal} ÷ ${coeff} = ${xVal}.`
          });
        }
        break;
      }

      case 'H': {
        // Systems of Linear Equations (SPLDV) & Inequalities
        const xVal = ((i + worksheetNum) % 5) + 2;
        const yVal = ((i * 2 + worksheetNum) % 4) + 1;
        const eq1Res = xVal + yVal;
        const eq2Res = 2 * xVal - yVal;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Tentukan himpunan penyelesaian (x, y) dari SPLDV berikut (format: x, y):',
          mathFormula: `\\begin{cases} x + y = ${eq1Res} \\\\[4pt] 2x - y = ${eq2Res} \\end{cases}`,
          isLatex: true,
          correctAnswer: `${xVal}, ${yVal}`,
          acceptableAnswers: [`${xVal}, ${yVal}`, `${xVal},${yVal}`, `(${xVal},${yVal})`, `(${xVal}, ${yVal})`, `x=${xVal},y=${yVal}`],
          explanation: `Eliminasi y dengan menjumlahkan kedua persamaan: 3x = ${eq1Res + eq2Res} ⟹ x = ${xVal}. Substitusikan ke x + y = ${eq1Res} ⟹ ${xVal} + y = ${eq1Res} ⟹ y = ${yVal}. Jadi pasangan penyelesaian adalah (x, y) = (${xVal}, ${yVal}).`
        });
        break;
      }

      case 'I': {
        // Factoring and Quadratic Equations
        const r1 = ((i + worksheetNum) % 4) + 1;
        const r2 = ((i * 2 + worksheetNum) % 5) + 2;
        const sumR = r1 + r2;
        const prodR = r1 * r2;
        const sumTerm = sumR === 1 ? 'x' : `${sumR}x`;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: `Tentukan akar-akar persamaan kuadrat berikut (format: ${Math.min(r1, r2)}, ${Math.max(r1, r2)}):`,
          mathFormula: `x^2 - ${sumTerm} + ${prodR} = 0`,
          isLatex: true,
          correctAnswer: `${Math.min(r1, r2)}, ${Math.max(r1, r2)}`,
          acceptableAnswers: [
            `${Math.min(r1, r2)}, ${Math.max(r1, r2)}`,
            `${Math.max(r1, r2)}, ${Math.min(r1, r2)}`,
            `${Math.min(r1, r2)},${Math.max(r1, r2)}`,
            `x=${r1}, x=${r2}`,
            `x=${r2}, x=${r1}`
          ],
          explanation: `Faktorkan: (x - ${r1})(x - ${r2}) = 0 ⟹ x - ${r1} = 0 atau x - ${r2} = 0 ⟹ x = ${r1} atau x = ${r2}.`
        });
        break;
      }

      case 'J': {
        // Polynomials and Remainder Theorem
        const a = ((i + worksheetNum) % 3) + 1;
        const c = ((i * 2 + worksheetNum) % 4) + 2;
        // P(x) = x^2 - a*x + c, evaluate at x = 3
        const val = 3 * 3 - a * 3 + c;
        const aTerm = a === 1 ? 'x' : `${a}x`;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Berapakah sisa pembagian suku banyak P(x) berikut jika dibagi oleh (x - 3):',
          mathFormula: `P(x) = x^2 - ${aTerm} + ${c}`,
          isLatex: true,
          correctAnswer: `${val}`,
          explanation: `Menurut Teorema Sisa, sisa pembagian P(x) oleh (x - 3) adalah S = P(3): P(3) = (3)² - ${a}(3) + ${c} = 9 - ${a * 3} + ${c} = ${val}.`
        });
        break;
      }

      case 'K': {
        // Exponents & Logarithms
        const base = ((i + worksheetNum) % 3) + 2; // 2, 3, 4
        const exp = ((i * 2 + worksheetNum) % 3) + 2; // 2, 3, 4
        const result = Math.pow(base, exp);
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Tentukan nilai x yang memenuhi persamaan logaritma berikut:',
          mathFormula: `\\log_{${base}}(${result}) = x`,
          isLatex: true,
          correctAnswer: `${exp}`,
          acceptableAnswers: [`${exp}`, `x=${exp}`, `x = ${exp}`],
          explanation: `Berdasarkan definisi logaritma: log_${base}(${result}) = x ⟺ ${base}^x = ${result}. Karena ${result} = ${base}^${exp}, maka diperoleh x = ${exp}.`
        });
        break;
      }

      case 'L': {
        // Trigonometry, Limits & Basic Derivatives
        const n = ((i + worksheetNum) % 4) + 2;
        const coeff = ((i * 2 + worksheetNum) % 3) + 2;
        const newCoeff = coeff * n;
        const newPower = n - 1;
        const term = newPower === 1 ? `${newCoeff}x` : `${newCoeff}x^${newPower}`;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Tentukan turunan pertama f\'(x) dari fungsi aljabar berikut:',
          mathFormula: `f(x) = ${coeff}x^{${n}}`,
          isLatex: true,
          options: [
            `${newCoeff}x^{${newPower}}`,
            `${coeff}x^{${newPower}}`,
            `${newCoeff}x^{${n}}`,
            `${coeff * 2}x^{${newPower}}`
          ].sort(() => 0.5 - Math.random()),
          correctAnswer: `${newCoeff}x^{${newPower}}`,
          explanation: `Gunakan aturan turunan pangkat: f'(x) = ${coeff} · ${n} · x^{${n} - 1} = ${term}.`
        });
        break;
      }

      case 'M': {
        // Comprehensive Calculus & Integrals
        const a = ((i + worksheetNum) % 3) + 1; // 1, 2, 3
        const upper = ((i * 2 + worksheetNum) % 3) + 2; // 2, 3, 4
        // \int_0^upper (2a x) dx = [a x^2]_0^upper = a * upper^2
        const ans = a * upper * upper;
        const coeffStr = 2 * a === 1 ? '' : `${2 * a}`;
        const antiCoeff = a === 1 ? '' : `${a}`;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Hitunglah nilai integral tentu kalkulus berikut:',
          mathFormula: `\\int_0^{${upper}} ${coeffStr}x \\, dx = \\dots`,
          isLatex: true,
          correctAnswer: `${ans}`,
          explanation: `Antiturunan: ∫ ${coeffStr}x dx = ${antiCoeff}x². Evaluasi batas Teorema Dasar Kalkulus: [${antiCoeff}x²]_0^${upper} = ${a}(${upper})² - ${a}(0)² = ${ans}.`
        });
        break;
      }

      default:
        break;
    }
  }

  // Ensure Question #1 is flagged as Example and all questions have full stepByStepSolution
  questions.forEach((q, idx) => {
    if (idx === 0) {
      q.isExample = true;
    }
    q.stepByStepSolution = getStepByStepSolutionForQuestion(levelId, q);
  });

  return questions;
}
