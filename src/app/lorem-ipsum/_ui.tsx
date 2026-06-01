'use client';

import { useState, useCallback } from 'react';
import CopyButton from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

// ─── Word banks ───────────────────────────────────────────────────────────────

const LATIN = [
  'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do',
  'eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim',
  'ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi',
  'aliquip','ex','ea','commodo','consequat','duis','aute','irure','reprehenderit',
  'voluptate','velit','esse','cillum','fugiat','nulla','pariatur','excepteur','sint',
  'occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt',
  'mollit','anim','id','est','laborum','vero','eos','accusamus','doloremque',
  'laudantium','totam','rem','aperiam','eaque','ipsa','quae','illo','inventore',
  'veritatis','quasi','architecto','beatae','vitae','dicta','explicabo','nemo','ipsam',
  'quia','voluptas','aspernatur','odit','consequuntur','magni','dolores','ratione',
  'sequi','nesciunt','neque','porro','quisquam','autem','vel','eum','iure',
  'quibusdam','officiis','debitis','rerum','necessitatibus','saepe','eveniet',
  'voluptates','repudiandae','recusandae','itaque','earum','hic','tenetur','sapiente',
  'delectus','reiciendis','voluptatibus','maiores','alias','perferendis','doloribus',
  'asperiores','repellat','perspiciatis','omnis','iste','natus','error','nihil',
  'molestiae','facere','possimus','optio','cumque','impedit','quo','minus','placeat',
  'maxime','assumenda','repellendus','temporibus','provident','similique','eligendi',
  'corporis','suscipit','laboriosam','aliquid','blanditiis','praesentium','voluptatum',
  'deleniti','atque','corrupti','quos','quas','mollitia','porro','excepturi',
  'occaecati','cupiditate','obcaecati','quidem','rerum','facilis','expedita',
  'distinctio','nam','libero','tempore','cum','soluta','nobis','eligendi','optio',
  'commodi','consequatur','praesent','commodo','cursus','magna','proin','rhoncus',
  'nisl','elementum','tortor','condimentum','lacinia','quis','congue','purus',
  'imperdiet','dapibus','auctor','nunc','pulvinar','sapien','etiam','scelerisque',
  'viverra','mauris','viverra','aliquet','eget','justo','pellentesque','habitant',
  'morbi','tristique','senectus','netus','malesuada','fames','turpis','egestas',
];

const INDONESIAN = [
  'adalah','akan','atau','bahwa','beberapa','berbagai','bisa','dalam','dari','dengan',
  'untuk','ini','itu','juga','karena','ke','kemudian','kepada','ketika','lebih',
  'melalui','memiliki','mendapatkan','merupakan','mereka','meskipun','mulai','namun',
  'oleh','pada','penting','perlu','sampai','sangat','sehingga','sebuah','setelah',
  'serta','selama','selain','semua','seperti','sudah','terhadap','terdapat','tersebut',
  'tetapi','tidak','tinggi','waktu','walaupun','yang','yaitu','dapat','harus','saat',
  'antara','agar','akibat','apalagi','artinya','bahkan','banyak','belum','berdasarkan',
  'berguna','berhasil','berikut','berlaku','berupa','bukan','cara','cukup','dampak',
  'demikian','digunakan','fungsi','hal','hampir','hidup','hubungan','informasi',
  'jenis','jika','justru','kebutuhan','kegiatan','kegunaan','kemungkinan','kondisi',
  'langkah','lainnya','maka','masalah','memang','mempunyai','menggunakan','menurut',
  'mudah','mungkin','nilai','paling','penggunaan','pertama','proses','program','salah',
  'sebagai','seluruh','setiap','sistem','situasi','sumber','tapi','tujuan','umum',
  'upaya','utama','wajib','apabila','bagaimana','berarti','berkembang','bersama',
  'bertujuan','biasanya','dasar','diharapkan','diperlukan','efektif','efisien',
  'faktor','gambaran','global','hasil','ideal','jaringan','kecil','keseluruhan',
  'konteks','kualitas','layanan','lingkungan','manfaat','membuat','mendukung',
  'menjadi','metode','minimal','model','modern','mutu','nyata','optimal','pemikiran',
  'penerapan','penelitian','pengetahuan','perkembangan','permasalahan','positif',
  'potensi','relevan','rencana','sebelumnya','sedangkan','sejumlah','sebagian',
  'signifikan','solusi','standar','strategi','studi','teknologi','terkait','tepat',
  'tingkat','transformasi','variabel','wawasan','kinerja','dinamis','fleksibel',
  'integrasi','analisis','evaluasi','implementasi','interaksi','kolaborasi',
  'komunikasi','koordinasi','optimasi','perencanaan','pemantauan','pengembangan',
  'pengelolaan','penilaian','penyusunan','perumusan','perancangan','pemrosesan',
];

// ─── Generators ───────────────────────────────────────────────────────────────

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genSentence(words: string[], len?: number): string {
  const count = len ?? (Math.floor(Math.random() * 10) + 6);
  const ws = Array.from({ length: count }, () => pick(words));
  ws[0] = ws[0].charAt(0).toUpperCase() + ws[0].slice(1);
  return ws.join(' ') + '.';
}

function genParagraph(words: string[]): string {
  const sentences = Math.floor(Math.random() * 4) + 3;
  return Array.from({ length: sentences }, () => genSentence(words)).join(' ');
}

type UnitType = 'paragraphs' | 'sentences' | 'words';
type Lang = 'latin' | 'id';

// ─── Component ────────────────────────────────────────────────────────────────

const CLASSIC_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

export default function LoremIpsumUI() {
  const [unit, setUnit] = useState<UnitType>('paragraphs');
  const [count, setCount] = useState(3);
  const [lang, setLang] = useState<Lang>('latin');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');

  const wordBank = lang === 'latin' ? LATIN : INDONESIAN;

  const generate = useCallback(() => {
    const parts: string[] = [];

    if (unit === 'paragraphs') {
      for (let i = 0; i < count; i++) parts.push(genParagraph(wordBank));
    } else if (unit === 'sentences') {
      for (let i = 0; i < count; i++) parts.push(genSentence(wordBank));
    } else {
      parts.push(Array.from({ length: count }, () => pick(wordBank)).join(' '));
    }

    let result = unit === 'paragraphs' ? parts.join('\n\n') : parts.join(' ');

    if (startWithLorem && lang === 'latin') {
      const suffix = result.replace(/^[^.!?]*[.!?]\s*/,'');
      result = CLASSIC_START + (suffix ? ' ' + suffix : '');
    }

    setOutput(result);
  }, [unit, count, lang, startWithLorem, wordBank]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Left — controls */}
      <div className="flex flex-col gap-5">
        {/* Type */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Type</label>
          <div className="flex flex-col gap-1">
            {(['paragraphs', 'sentences', 'words'] as UnitType[]).map((t) => (
              <button key={t} onClick={() => setUnit(t)}
                className={cn('rounded-lg border px-3 py-2 text-sm capitalize text-left transition-colors duration-150',
                  unit === t ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white')}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Count</label>
            <span className="font-mono text-sm font-semibold text-white">{count}</span>
          </div>
          <input type="range" min={1} max={unit === 'words' ? 500 : 50} value={count}
            onChange={(e) => setCount(+e.target.value)}
            className="w-full accent-cyan-400" />
          <div className="flex justify-between text-xs text-slate-600">
            <span>1</span><span>{unit === 'words' ? 500 : 50}</span>
          </div>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Language</label>
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
            {([['latin', 'Latin'] as const, ['id', 'Bahasa Indonesia'] as const]).map(([v, lbl]) => (
              <button key={v} onClick={() => setLang(v)}
                className={cn('flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors duration-150',
                  lang === v ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white')}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Start with Lorem ipsum */}
        {lang === 'latin' && (
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)}
              className="h-4 w-4 accent-cyan-400" />
            <span className="text-sm text-slate-300">Start with "Lorem ipsum…"</span>
          </label>
        )}

        <button onClick={generate}
          className="rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors duration-150">
          Generate
        </button>
      </div>

      {/* Right — output */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Output</label>
          {output && <CopyButton value={output} />}
        </div>
        <textarea
          readOnly
          value={output}
          rows={16}
          placeholder="Click Generate to create placeholder text…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 resize-y"
        />
        {output && (
          <p className="text-xs text-slate-600">
            {output.split(/\s+/).filter(Boolean).length} words ·{' '}
            {output.length} characters
          </p>
        )}
      </div>
    </div>
  );
}
