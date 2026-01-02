import { useEffect, useMemo, useState } from "react"

type Entry = {
  name: string
  url: string
}

const tabs = [
  { id: "all", label: "全部" },
  { id: "advertising", label: "广告" },
  { id: "reject", label: "拒绝" },
  { id: "google", label: "Google" },
  { id: "apple", label: "Apple" },
  { id: "microsoft", label: "Microsoft" },
  { id: "china", label: "中国" },
  { id: "global", label: "全球" },
  { id: "other", label: "其他" },
] as const

type TabId = (typeof tabs)[number]["id"]

const tabLabels: Record<TabId, string> = {
  all: "全部",
  advertising: "广告",
  reject: "拒绝",
  google: "Google",
  apple: "Apple",
  microsoft: "Microsoft",
  china: "中国",
  global: "全球",
  other: "其他",
}

const getCategory = (name: string): TabId => {
  const lowerName = name.toLowerCase()

  if (lowerName.includes("advertising") || lowerName === "zhihuads" || lowerName === "direct") {
    return "advertising"
  }

  if (
    lowerName.includes("hijacking") ||
    lowerName.includes("privacy") ||
    lowerName.includes("adguardsdnfilter") ||
    lowerName.includes("easyprivacy") ||
    lowerName.includes("blockhttpdns")
  ) {
    return "reject"
  }

  if (
    lowerName.includes("google") ||
    lowerName.includes("youtube") ||
    lowerName.includes("chromecast") ||
    lowerName.includes("gemini") ||
    lowerName.includes("bardai") ||
    lowerName === "gmail"
  ) {
    return "google"
  }

  if (
    lowerName.includes("apple") ||
    lowerName.includes("icloud") ||
    lowerName.includes("appstore") ||
    lowerName.includes("testflight") ||
    lowerName.includes("siri") ||
    lowerName.includes("fitnessplus") ||
    lowerName.includes("findmy") ||
    lowerName.includes("beats") ||
    lowerName.includes("systemota") ||
    lowerName === "imessage"
  ) {
    return "apple"
  }

  if (
    lowerName.includes("microsoft") ||
    lowerName.includes("onedrive") ||
    lowerName === "github" ||
    lowerName.includes("teams") ||
    lowerName === "bing" ||
    lowerName.includes("copilot") ||
    lowerName.includes("microsoftedge")
  ) {
    return "microsoft"
  }

  const chinaKeywords = [
    "china",
    "baidu",
    "alibaba",
    "tencent",
    "weibo",
    "bilibili",
    "zhihu",
    "qq",
    "wechat",
    "douyin",
    "xiaohongshu",
    "taobao",
    "tmall",
    "jd",
    "jingdong",
    "meituan",
    "dianping",
    "ctrip",
    "xiecheng",
    "12306",
    "icbc",
    "ccb",
    "abc",
    "boc",
    "cmb",
    "pingan",
    "unionpay",
    "alipay",
    "youku",
    "iqiyi",
    "iqiyiintl",
    "acfun",
    "douyu",
    "huya",
    "zhanqi",
    "netease",
    "neteasemusic",
    "kugou",
    "kuwo",
    "xiami",
    "qiyi",
    "cnki",
    "wanfang",
    "dingxiangyuan",
    "xueqiu",
    "eastmoney",
    "sina",
    "sohu",
    "ifeng",
    "people",
    "xinhua",
    "cctv",
    "cbn",
    "smg",
  ]
  if (chinaKeywords.some((keyword) => lowerName.includes(keyword))) {
    return "china"
  }

  const globalKeywords = [
    "global",
    "proxy",
    "netflix",
    "tiktok",
    "disney",
    "twitter",
    "telegram",
    "facebook",
    "instagram",
    "whatsapp",
    "spotify",
    "wikipedia",
    "discord",
    "mail",
    "paypal",
    "amazon",
    "ebay",
    "reddit",
    "linkedin",
    "pinterest",
    "tumblr",
    "snapchat",
    "vimeo",
    "dropbox",
    "mega",
    "slack",
    "zoom",
    "skype",
    "line",
    "kakaotalk",
    "twitch",
    "hulu",
    "hbo",
    "paramount",
    "peacock",
    "fubo",
    "sling",
    "dazn",
    "nbc",
    "cbs",
    "fox",
    "cnn",
    "bbc",
    "reuters",
    "bloomberg",
    "wsj",
    "ft",
    "economist",
  ]
  if (globalKeywords.some((keyword) => lowerName.includes(keyword))) {
    return "global"
  }

  return "other"
}

const extractUrlPath = (url: string) => {
  try {
    const match = url.match(/rule\.kelee\.one\/[^\s&]+/)
    return match ? match[0] : url
  } catch {
    return url
  }
}

function App() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [activeTab, setActiveTab] = useState<TabId>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let active = true

    fetch("/loon-rules.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: Entry[]) => {
        if (!active) return
        setEntries(data)
        setErrorMessage("")
      })
      .catch((err: Error) => {
        if (!active) return
        setErrorMessage(`Failed to load loon-rules.json: ${err.message}`)
      })

    return () => {
      active = false
    }
  }, [])

  const scopedEntries = useMemo(() => {
    if (activeTab === "all") return entries
    return entries.filter((entry) => getCategory(entry.name) === activeTab)
  }, [entries, activeTab])

  const filteredEntries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return scopedEntries
    return scopedEntries.filter(({ name }) => name.toLowerCase().includes(q))
  }, [scopedEntries, searchTerm])

  const filteredCount = filteredEntries.length
  const scopedCount = scopedEntries.length
  const hasError = errorMessage !== ""

  const statusText = useMemo(() => {
    if (errorMessage) return errorMessage
    const q = searchTerm.trim().toLowerCase()
    if (q) {
      return `${filteredCount} of ${scopedCount} matched`
    }
    if (activeTab !== "all") {
      return tabLabels[activeTab]
    }
    return ""
  }, [activeTab, errorMessage, filteredCount, scopedCount, searchTerm])

  const openUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex items-center justify-between gap-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/25">
                  <svg
                    className="h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h1 className="m-0 text-xl font-bold tracking-tight text-gray-900">Loon Rules</h1>
                  <p className="m-0 text-xs text-gray-500">Curated proxy rules collection</p>
                </div>
              </div>
            </div>

            <label className="relative flex-1 max-w-md" aria-label="Search services">
              <svg
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 stroke-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                type="search"
                placeholder="Search rules..."
                autoComplete="off"
                className="w-full rounded-full border border-gray-200 bg-gray-50/80 py-2.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </label>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 text-sm font-medium shadow-sm">
                <span className="font-bold text-gray-900">{filteredCount}</span>
                <span className="text-gray-500">rules</span>
              </span>
            </div>
          </div>

          <div
            className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto pb-3"
            role="tablist"
            aria-label="Filter services"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-gray-900 bg-gray-900 text-white shadow-md"
                    : "border-gray-200 bg-white/80 text-gray-600 hover:border-gray-300 hover:bg-white hover:text-gray-900"
                }`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 pb-12 pt-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {filteredEntries.map((entry) => (
            <div
              key={entry.name}
              className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="m-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-gray-900">
                  {entry.name}
                </h3>
                <button
                  onClick={() => openUrl(entry.url)}
                  className="flex-shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow active:scale-[0.98]"
                  type="button"
                >
                  GET
                </button>
              </div>
              <p className="m-0 break-all text-xs leading-relaxed text-gray-500">
                {extractUrlPath(entry.url)}
              </p>
            </div>
          ))}
        </div>
        <div className={`mt-6 text-sm ${hasError ? "text-red-600" : "text-gray-500"}`}>
          {statusText}
        </div>
      </main>
    </div>
  )
}

export default App
