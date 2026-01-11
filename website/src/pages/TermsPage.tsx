import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Footer from '../components/Footer';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <h2 className="text-xl font-medium text-[#171717] dark:text-[#ededed]">{title}</h2>
    <div className="text-[#666] dark:text-[#8f8f8f] space-y-3">{children}</div>
  </div>
);

const ListItem = ({
  type,
  children,
}: {
  type: 'allowed' | 'prohibited';
  children: React.ReactNode;
}) => (
  <li className="flex items-start gap-3">
    {type === 'allowed' ? (
      <CheckCircle className="h-5 w-5 text-[#0a7227] dark:text-[#4ade80] flex-shrink-0 mt-0.5" />
    ) : (
      <XCircle className="h-5 w-5 text-[#c00] dark:text-[#f87171] flex-shrink-0 mt-0.5" />
    )}
    <span>{children}</span>
  </li>
);

const HighlightBox = ({
  type,
  children,
}: {
  type: 'info' | 'warning' | 'success';
  children: React.ReactNode;
}) => {
  const styles = {
    info: 'bg-[#e6f4ff] dark:bg-[#0a2a3d] border-[#91caff] dark:border-[#1e40af] text-[#0050b3] dark:text-[#60a5fa]',
    warning: 'bg-[#fff8e6] dark:bg-[#3d2e0a] border-[#ffe58f] dark:border-[#92400e] text-[#915b00] dark:text-[#fbbf24]',
    success: 'bg-[#d3f9d8] dark:bg-[#0a3d1a] border-[#b8f0c0] dark:border-[#166534] text-[#0a7227] dark:text-[#4ade80]',
  };

  return (
    <div className={`rounded-lg border p-4 ${styles[type]}`}>
      {children}
    </div>
  );
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#eaeaea] dark:border-[#333]">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#171717] dark:text-[#ededed]" />
              <span className="font-medium text-[#171717] dark:text-[#ededed]">Pleno Anonymize</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-[#666] dark:text-[#8f8f8f] hover:text-[#171717] dark:hover:text-[#ededed] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <h1 className="text-4xl font-medium text-[#171717] dark:text-[#ededed] mb-8">
            Terms of Service
          </h1>

          <div className="space-y-8">
            <Section title="1. Acceptance">
              <p>
                Pleno Anonymize（以下「本ソフトウェア」）を利用することにより、
                本利用規約に同意したものとみなされます。
              </p>
            </Section>

            <Section title="2. License">
              <HighlightBox type="success">
                <p>
                  本ソフトウェアはオープンソースソフトウェアとして提供されています。
                  ライセンスの詳細はGitHubリポジトリをご確認ください。
                </p>
              </HighlightBox>
            </Section>

            <Section title="3. Permitted Use">
              <p>以下の用途での利用が許可されています</p>
              <ul className="space-y-2 mt-4">
                <ListItem type="allowed">個人・商用目的でのAPI利用</ListItem>
                <ListItem type="allowed">ソースコードの改変・カスタマイズ</ListItem>
                <ListItem type="allowed">派生物の作成と配布</ListItem>
                <ListItem type="allowed">社内システムへの組み込み</ListItem>
              </ul>
            </Section>

            <Section title="4. Prohibited Use">
              <p>以下の用途での利用は禁止されています</p>
              <ul className="space-y-2 mt-4">
                <ListItem type="prohibited">違法行為への利用</ListItem>
                <ListItem type="prohibited">他者の権利を侵害する目的での利用</ListItem>
                <ListItem type="prohibited">悪意あるソフトウェアの作成</ListItem>
              </ul>
            </Section>

            <Section title="5. Disclaimer">
              <HighlightBox type="warning">
                <p>
                  本ソフトウェアは「現状のまま」提供されます。
                  開発者は、本ソフトウェアの利用により生じたいかなる損害についても
                  責任を負いません。PIIの検出精度は100%を保証するものではありません。
                </p>
              </HighlightBox>
            </Section>

            <Section title="6. LLM API Usage">
              <p>
                本ソフトウェアはspaCy-LLMを通じてOpenAI APIを利用します。
                OpenAI APIの利用については、OpenAIの利用規約およびAPI使用ポリシーに
                従う必要があります。
              </p>
            </Section>

            <Section title="7. Privacy">
              <p>
                データの取り扱いについては、
                <Link to="/privacy" className="text-[#0050b3] dark:text-[#60a5fa] hover:underline">
                  プライバシーポリシー
                </Link>
                をご確認ください。
              </p>
            </Section>

            <Section title="8. Changes">
              <p>
                本利用規約は予告なく変更されることがあります。
                変更後の利用規約は、GitHubリポジトリおよび本ウェブサイトに掲載された時点で
                効力を生じます。
              </p>
            </Section>

            <Section title="9. Contact">
              <p>
                本利用規約に関するお問い合わせは、GitHubのIssueまたは
                運営会社までお願いいたします。
              </p>
            </Section>

            <Section title="10. Governing Law">
              <p>
                本利用規約は日本法に準拠し、解釈されます。
                本ソフトウェアに関連する紛争については、東京地方裁判所を
                第一審の専属的合意管轄裁判所とします。
              </p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
