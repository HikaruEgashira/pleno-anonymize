import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Eye,
  UserX,
  Zap,
  Lock,
  ChevronRight,
  Menu,
  X,
  ArrowLeft,
  Download,
  Server,
  Code,
  FileText,
} from 'lucide-react';
import Footer from '../components/Footer';

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  subsections?: { id: string; title: string }[];
}

const docSections: DocSection[] = [
  {
    id: 'overview',
    title: '概要',
    icon: FileText,
  },
  {
    id: 'getting-started',
    title: 'クイックスタート',
    icon: Download,
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: Code,
    subsections: [
      { id: 'analyze', title: 'POST /api/analyze' },
      { id: 'redact', title: 'POST /api/redact' },
      { id: 'openai-proxy', title: '* /api/openai/*' },
    ],
  },
  {
    id: 'architecture',
    title: 'アーキテクチャ',
    icon: Server,
    subsections: [
      { id: 'presidio', title: 'Presidio' },
      { id: 'spacy-llm', title: 'spaCy-LLM' },
      { id: 'tech-stack', title: '技術スタック' },
    ],
  },
  {
    id: 'privacy',
    title: 'プライバシー',
    icon: Lock,
  },
];

const Sidebar = ({
  activeSection,
  onSectionChange,
  isMobileOpen,
  onMobileClose,
}: {
  activeSection: string;
  onSectionChange: (id: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['api', 'architecture'])
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-white dark:bg-[#0a0a0a] border-r border-[#eaeaea] dark:border-[#333] z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#eaeaea] dark:border-[#333]">
          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#171717] dark:text-[#ededed]" />
            <span className="font-medium text-[#171717] dark:text-[#ededed]">
              Pleno Anonymize
            </span>
          </Link>
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
          >
            <X className="h-5 w-5 text-[#666] dark:text-[#8f8f8f]" />
          </button>
        </div>

        <div className="p-4 border-b border-[#eaeaea] dark:border-[#333]">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-[#666] dark:text-[#8f8f8f] hover:text-[#171717] dark:hover:text-[#ededed] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>

        <nav className="p-4 overflow-y-auto h-[calc(100%-120px)]">
          <ul className="space-y-1">
            {docSections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.has(section.id);
              const isActive = activeSection === section.id;

              return (
                <li key={section.id}>
                  <button
                    onClick={() => {
                      if (section.subsections) {
                        toggleSection(section.id);
                      }
                      onSectionChange(section.id);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                      ${isActive
                        ? 'bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#171717] dark:text-[#ededed]'
                        : 'text-[#666] dark:text-[#8f8f8f] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] hover:text-[#171717] dark:hover:text-[#ededed]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{section.title}</span>
                    </div>
                    {section.subsections && (
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    )}
                  </button>

                  {section.subsections && isExpanded && (
                    <ul className="mt-1 ml-6 space-y-1">
                      {section.subsections.map((sub) => (
                        <li key={sub.id}>
                          <button
                            onClick={() => onSectionChange(sub.id)}
                            className={`
                              w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                              ${activeSection === sub.id
                                ? 'bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#171717] dark:text-[#ededed]'
                                : 'text-[#666] dark:text-[#8f8f8f] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'
                              }
                            `}
                          >
                            {sub.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

const CodeBlock = ({ children }: { children: string }) => (
  <div className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-[#1a1a1a] p-4 overflow-x-auto">
    <pre className="text-sm">
      <code className="text-[#e5e5e5]">{children}</code>
    </pre>
  </div>
);

const OverviewSection = () => (
  <section id="overview" className="space-y-6">
    <h1 className="text-3xl font-medium text-[#171717] dark:text-[#ededed]">
      概要
    </h1>
    <p className="text-lg text-[#666] dark:text-[#8f8f8f]">
      日本語対応の個人情報（PII）匿名化API。Presidio + spaCy-LLM を使用して
      高精度な検出とマスキングを実現します。
    </p>

    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-[#fafafa] dark:bg-[#111] p-6">
        <Eye className="h-8 w-8 text-[#171717] dark:text-[#ededed] mb-4" />
        <h3 className="text-lg font-medium text-[#171717] dark:text-[#ededed] mb-2">
          PII検出
        </h3>
        <p className="text-[#666] dark:text-[#8f8f8f]">
          テキストから人名、住所、電話番号などの個人情報を検出します。
        </p>
      </div>
      <div className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-[#fafafa] dark:bg-[#111] p-6">
        <UserX className="h-8 w-8 text-[#171717] dark:text-[#ededed] mb-4" />
        <h3 className="text-lg font-medium text-[#171717] dark:text-[#ededed] mb-2">
          匿名化
        </h3>
        <p className="text-[#666] dark:text-[#8f8f8f]">
          検出されたPIIをプレースホルダーに置換して匿名化します。
        </p>
      </div>
    </div>

    <div className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-white dark:bg-[#171717] p-6">
      <h3 className="text-lg font-medium text-[#171717] dark:text-[#ededed] mb-4">
        検出可能なエンティティ
      </h3>
      <ul className="space-y-3">
        {[
          'PERSON - 人名',
          'LOCATION - 住所・地名',
          'PHONE_NUMBER - 電話番号',
          'EMAIL_ADDRESS - メールアドレス',
          'CREDIT_CARD - クレジットカード番号',
          'IP_ADDRESS - IPアドレス',
        ].map((item, i) => (
          <li key={i} className="flex items-center gap-3 text-[#666] dark:text-[#8f8f8f]">
            <div className="h-1.5 w-1.5 rounded-full bg-[#171717] dark:bg-[#ededed]" />
            <code className="text-sm bg-[#f5f5f5] dark:bg-[#2a2a2a] px-2 py-0.5 rounded">{item}</code>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const GettingStartedSection = () => (
  <section id="getting-started" className="space-y-6">
    <h1 className="text-3xl font-medium text-[#171717] dark:text-[#ededed]">
      クイックスタート
    </h1>

    <div className="space-y-8">
      <div className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-white dark:bg-[#171717] p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#171717] dark:bg-[#ededed] text-white dark:text-[#0a0a0a] font-medium">
            1
          </div>
          <h3 className="text-lg font-medium text-[#171717] dark:text-[#ededed]">
            依存関係のインストール
          </h3>
        </div>
        <CodeBlock>{`uv sync`}</CodeBlock>
      </div>

      <div className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-white dark:bg-[#171717] p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#171717] dark:bg-[#ededed] text-white dark:text-[#0a0a0a] font-medium">
            2
          </div>
          <h3 className="text-lg font-medium text-[#171717] dark:text-[#ededed]">
            サーバーを起動
          </h3>
        </div>
        <CodeBlock>{`dotenvx run -f ~/.config/secrets/.env -- uv run uvicorn app:app --reload --port 8000`}</CodeBlock>
      </div>

      <div className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-white dark:bg-[#171717] p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#171717] dark:bg-[#ededed] text-white dark:text-[#0a0a0a] font-medium">
            3
          </div>
          <h3 className="text-lg font-medium text-[#171717] dark:text-[#ededed]">
            APIをテスト（本番環境）
          </h3>
        </div>
        <CodeBlock>{`curl -X POST https://anonymize.plenoai.com/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"text": "山田太郎さんの電話番号は090-1234-5678です。"}'`}</CodeBlock>
      </div>
    </div>
  </section>
);

const ApiSection = () => (
  <section id="api" className="space-y-8">
    <h1 className="text-3xl font-medium text-[#171717] dark:text-[#ededed]">
      API Reference
    </h1>

    <div className="rounded-lg bg-[#e6f4ff] dark:bg-[#0a2a3d] border border-[#91caff] dark:border-[#1d4ed8] p-4 mb-6">
      <p className="text-sm text-[#0050b3] dark:text-[#60a5fa]">
        <strong>Base URL:</strong> <code>https://anonymize.plenoai.com</code>
      </p>
    </div>

    <div id="analyze" className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-white dark:bg-[#171717] p-6 scroll-mt-20">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-2 py-1 text-xs font-medium rounded bg-[#d3f9d8] dark:bg-[#0a3d1a] text-[#0a7227] dark:text-[#4ade80]">POST</span>
        <code className="text-lg font-medium text-[#171717] dark:text-[#ededed]">/api/analyze</code>
      </div>
      <p className="text-[#666] dark:text-[#8f8f8f] mb-4">
        テキストからPIIエンティティを検出します。
      </p>

      <h4 className="font-medium text-[#171717] dark:text-[#ededed] mb-2">Request Body</h4>
      <CodeBlock>{`{
  "text": "山田太郎さんの電話番号は090-1234-5678です。",
  "language": "en"
}`}</CodeBlock>

      <h4 className="font-medium text-[#171717] dark:text-[#ededed] mt-4 mb-2">Response</h4>
      <CodeBlock>{`[
  {
    "entity_type": "PERSON",
    "text": "山田太郎",
    "start": 0,
    "end": 4,
    "score": 0.85
  },
  {
    "entity_type": "PHONE_NUMBER",
    "text": "090-1234-5678",
    "start": 13,
    "end": 26,
    "score": 0.99
  }
]`}</CodeBlock>
    </div>

    <div id="redact" className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-white dark:bg-[#171717] p-6 scroll-mt-20">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-2 py-1 text-xs font-medium rounded bg-[#d3f9d8] dark:bg-[#0a3d1a] text-[#0a7227] dark:text-[#4ade80]">POST</span>
        <code className="text-lg font-medium text-[#171717] dark:text-[#ededed]">/api/redact</code>
      </div>
      <p className="text-[#666] dark:text-[#8f8f8f] mb-4">
        テキストのPIIを匿名化（マスキング）します。
      </p>

      <h4 className="font-medium text-[#171717] dark:text-[#ededed] mb-2">Request Body</h4>
      <CodeBlock>{`{
  "text": "山田太郎さんの電話番号は090-1234-5678です。",
  "language": "en"
}`}</CodeBlock>

      <h4 className="font-medium text-[#171717] dark:text-[#ededed] mt-4 mb-2">Response</h4>
      <CodeBlock>{`{
  "text": "<PERSON>さんの電話番号は<PHONE_NUMBER>です。",
  "items": ["replace", "replace"]
}`}</CodeBlock>
    </div>

    <div id="openai-proxy" className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-white dark:bg-[#171717] p-6 scroll-mt-20">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-2 py-1 text-xs font-medium rounded bg-[#fef3c7] dark:bg-[#3d2e0a] text-[#92400e] dark:text-[#fbbf24]">*</span>
        <code className="text-lg font-medium text-[#171717] dark:text-[#ededed]">/api/openai/*</code>
      </div>
      <p className="text-[#666] dark:text-[#8f8f8f] mb-4">
        OpenAI APIへのプロキシエンドポイント。全てのHTTPメソッドに対応。
      </p>

      <h4 className="font-medium text-[#171717] dark:text-[#ededed] mb-2">Example</h4>
      <CodeBlock>{`curl https://anonymize.plenoai.com/api/openai/v1/models \\
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY"`}</CodeBlock>
    </div>
  </section>
);

const ArchitectureSection = () => (
  <section id="architecture" className="space-y-8">
    <h1 className="text-3xl font-medium text-[#171717] dark:text-[#ededed]">
      アーキテクチャ
    </h1>

    <div id="presidio" className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-white dark:bg-[#171717] p-6 scroll-mt-20">
      <h2 className="text-xl font-medium text-[#171717] dark:text-[#ededed] mb-4">
        Presidio
      </h2>
      <p className="text-[#666] dark:text-[#8f8f8f]">
        MicrosoftのPresidioは、PIIの検出と匿名化のためのフレームワークです。
        パターンマッチングとNLPを組み合わせて高精度な検出を実現します。
      </p>
    </div>

    <div id="spacy-llm" className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-white dark:bg-[#171717] p-6 scroll-mt-20">
      <h2 className="text-xl font-medium text-[#171717] dark:text-[#ededed] mb-4">
        spaCy-LLM
      </h2>
      <p className="text-[#666] dark:text-[#8f8f8f] mb-4">
        spaCy-LLMは、LLMを使用した固有表現抽出（NER）を実現します。
        日本語テキストの人名や住所などを高精度で検出できます。
      </p>
      <div className="rounded-lg bg-[#fff8e6] dark:bg-[#3d2e0a] border border-[#ffe58f] dark:border-[#92400e] p-4">
        <p className="text-sm text-[#915b00] dark:text-[#fbbf24]">
          <strong>Note:</strong> 使用可能なモデルは gpt-5-nano のみです。
        </p>
      </div>
    </div>

    <div id="tech-stack" className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-white dark:bg-[#171717] p-6 scroll-mt-20">
      <h2 className="text-xl font-medium text-[#171717] dark:text-[#ededed] mb-4">
        技術スタック
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#eaeaea] dark:border-[#333]">
              <th className="text-left py-3 px-4 font-medium text-[#171717] dark:text-[#ededed]">項目</th>
              <th className="text-left py-3 px-4 font-medium text-[#171717] dark:text-[#ededed]">技術</th>
            </tr>
          </thead>
          <tbody className="text-[#666] dark:text-[#8f8f8f]">
            <tr className="border-b border-[#eaeaea] dark:border-[#333]">
              <td className="py-3 px-4">Infrastructure</td>
              <td className="py-3 px-4">AWS Lambda (Container Image)</td>
            </tr>
            <tr className="border-b border-[#eaeaea] dark:border-[#333]">
              <td className="py-3 px-4">API Gateway</td>
              <td className="py-3 px-4">AWS API Gateway HTTP API</td>
            </tr>
            <tr className="border-b border-[#eaeaea] dark:border-[#333]">
              <td className="py-3 px-4">Web Framework</td>
              <td className="py-3 px-4">FastAPI</td>
            </tr>
            <tr className="border-b border-[#eaeaea] dark:border-[#333]">
              <td className="py-3 px-4">PII Framework</td>
              <td className="py-3 px-4">Microsoft Presidio</td>
            </tr>
            <tr className="border-b border-[#eaeaea] dark:border-[#333]">
              <td className="py-3 px-4">NLP</td>
              <td className="py-3 px-4">spaCy + spaCy-LLM</td>
            </tr>
            <tr className="border-b border-[#eaeaea] dark:border-[#333]">
              <td className="py-3 px-4">LLM</td>
              <td className="py-3 px-4">gpt-5-nano (OpenAI)</td>
            </tr>
            <tr className="border-b border-[#eaeaea] dark:border-[#333]">
              <td className="py-3 px-4">DNS</td>
              <td className="py-3 px-4">Cloudflare</td>
            </tr>
            <tr>
              <td className="py-3 px-4">言語</td>
              <td className="py-3 px-4">Python</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

const PrivacySection = () => (
  <section id="privacy" className="space-y-6">
    <h1 className="text-3xl font-medium text-[#171717] dark:text-[#ededed]">
      プライバシー
    </h1>

    <div className="rounded-xl border border-[#eaeaea] dark:border-[#333] bg-white dark:bg-[#171717] p-6">
      <h2 className="text-xl font-medium text-[#171717] dark:text-[#ededed] mb-4">
        データの取り扱い
      </h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#d3f9d8] dark:bg-[#0a3d1a] flex-shrink-0 mt-0.5">
            <Lock className="h-3 w-3 text-[#0a7227] dark:text-[#4ade80]" />
          </div>
          <div>
            <h4 className="font-medium text-[#171717] dark:text-[#ededed]">
              セルフホスト
            </h4>
            <p className="text-sm text-[#666] dark:text-[#8f8f8f]">
              APIは自身のサーバーでホストするため、データが外部に送信されることはありません。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#d3f9d8] dark:bg-[#0a3d1a] flex-shrink-0 mt-0.5">
            <Lock className="h-3 w-3 text-[#0a7227] dark:text-[#4ade80]" />
          </div>
          <div>
            <h4 className="font-medium text-[#171717] dark:text-[#ededed]">
              ログなし
            </h4>
            <p className="text-sm text-[#666] dark:text-[#8f8f8f]">
              処理されたテキストはログに保存されません。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#e6f4ff] dark:bg-[#0a2a3d] flex-shrink-0 mt-0.5">
            <Zap className="h-3 w-3 text-[#0050b3] dark:text-[#60a5fa]" />
          </div>
          <div>
            <h4 className="font-medium text-[#171717] dark:text-[#ededed]">
              LLM APIコール
            </h4>
            <p className="text-sm text-[#666] dark:text-[#8f8f8f]">
              spaCy-LLMによるNER処理時のみ、OpenAI APIにテキストが送信されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const subsectionIds = new Set([
  'analyze',
  'redact',
  'openai-proxy',
  'presidio',
  'spacy-llm',
  'tech-stack',
]);

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (subsectionIds.has(activeSection)) {
      setTimeout(() => {
        const element = document.getElementById(activeSection);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [activeSection]);

  const getMainSectionKey = () => {
    if (['analyze', 'redact', 'openai-proxy'].includes(activeSection)) {
      return 'api';
    }
    if (['presidio', 'spacy-llm', 'tech-stack'].includes(activeSection)) {
      return 'architecture';
    }
    return activeSection;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'getting-started':
        return <GettingStartedSection />;
      case 'api':
      case 'analyze':
      case 'redact':
      case 'openai-proxy':
        return <ApiSection />;
      case 'architecture':
      case 'presidio':
      case 'spacy-llm':
      case 'tech-stack':
        return <ArchitectureSection />;
      case 'privacy':
        return <PrivacySection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a]">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-[#0a0a0a] border-b border-[#eaeaea] dark:border-[#333] z-30 flex items-center px-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
        >
          <Menu className="h-5 w-5 text-[#666] dark:text-[#8f8f8f]" />
        </button>
        <span className="ml-3 font-medium text-[#171717] dark:text-[#ededed]">
          API Docs
        </span>
      </header>

      <div className="flex flex-1">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(id) => {
            setActiveSection(id);
            setIsMobileMenuOpen(false);
          }}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 pt-14 lg:pt-0 lg:ml-72">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <motion.div
              key={getMainSectionKey()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
