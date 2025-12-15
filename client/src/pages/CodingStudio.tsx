import { useState, useRef, useEffect } from "react";
import Layout from "@/components/dashboard/Layout";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Code2, 
  Send,
  Copy,
  Check,
  Loader2,
  User,
  Bot,
  Sparkles,
  Trash2,
  Youtube,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface GenerateResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  provider: string;
}

const PROVIDERS = [
  { id: "openai", name: "OpenAI", model: "gpt-4o" },
  { id: "anthropic", name: "Anthropic", model: "claude-sonnet-4-20250514" },
  { id: "xai", name: "xAI (Grok)", model: "grok-2" },
  { id: "perplexity", name: "Perplexity", model: "sonar" },
  { id: "google", name: "Google Gemini", model: "gemini-2.0-flash" },
];

const YOUTUBE_URL_STORAGE_KEY = "codingStudio_youtubeUrl";

function extractCodeFromResponse(content: string): string {
  const codeBlockRegex = /```[\w]*\n?([\s\S]*?)```/g;
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    matches.push(match);
  }
  
  if (matches.length > 0) {
    return matches.map(m => m[1].trim()).join("\n\n");
  }
  
  return content;
}

function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

export default function CodingStudio() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [provider, setProvider] = useState("openai");
  const [editorContent, setEditorContent] = useState("// Generated code will appear here\n// Select a provider and enter a prompt to get started\n");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [youtubeUrl, setYoutubeUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(YOUTUBE_URL_STORAGE_KEY) || "";
    }
    return "";
  });
  const [youtubeInputValue, setYoutubeInputValue] = useState(youtubeUrl);
  const [isYoutubePanelOpen, setIsYoutubePanelOpen] = useState(true);

  useEffect(() => {
    if (youtubeUrl) {
      localStorage.setItem(YOUTUBE_URL_STORAGE_KEY, youtubeUrl);
    }
  }, [youtubeUrl]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await apiRequest("POST", "/api/code-assistant/generate", {
        prompt,
        provider,
        conversationHistory,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate code");
      }

      return res.json() as Promise<GenerateResponse>;
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      const code = extractCodeFromResponse(data.content);
      if (code) {
        setEditorContent(code);
      }

      if (data.usage) {
        toast({
          title: "Code generated",
          description: `Tokens used: ${data.usage.inputTokens} in, ${data.usage.outputTokens} out`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!inputValue.trim() || generateMutation.isPending) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    generateMutation.mutate(inputValue);
    setInputValue("");
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(editorContent);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setEditorContent("// Generated code will appear here\n// Select a provider and enter a prompt to get started\n");
    toast({
      title: "Chat cleared",
      description: "Conversation history has been reset",
    });
  };

  const handleLoadYoutubeVideo = () => {
    const videoId = extractYouTubeVideoId(youtubeInputValue);
    if (videoId) {
      setYoutubeUrl(youtubeInputValue);
      toast({
        title: "Video loaded",
        description: "YouTube tutorial is now playing",
      });
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
    }
  };

  const handleClearYoutubeVideo = () => {
    setYoutubeUrl("");
    setYoutubeInputValue("");
    localStorage.removeItem(YOUTUBE_URL_STORAGE_KEY);
  };

  const selectedProvider = PROVIDERS.find(p => p.id === provider);
  const currentVideoId = extractYouTubeVideoId(youtubeUrl);

  const ChatPanel = (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Coding Assistant
          </h2>
          <p className="text-xs text-muted-foreground">Generate code with multiple AI providers</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={provider} onValueChange={setProvider} data-testid="select-provider">
            <SelectTrigger className="w-[160px]" data-testid="select-provider-trigger">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map(p => (
                <SelectItem key={p.id} value={p.id} data-testid={`select-provider-${p.id}`}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearChat}
            className="h-9 w-9 p-0"
            data-testid="button-clear-chat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 glass-panel rounded-xl p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground" data-testid="chat-empty-state">
              <Bot className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Enter a prompt below to generate code</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${msg.id}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary/20 text-primary-foreground"
                        : "bg-white/5 text-muted-foreground"
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    <span className="text-[10px] opacity-50 mt-1 block">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {generateMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
              data-testid="loading-indicator"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <span className="text-sm text-muted-foreground">
                  Generating with {selectedProvider?.name}...
                </span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="glass-panel p-3 rounded-xl">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Describe the code you want to generate..."
          className="min-h-[80px] bg-transparent border-none resize-none focus-visible:ring-0"
          data-testid="input-prompt"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </span>
          <Button 
            onClick={handleSubmit}
            disabled={!inputValue.trim() || generateMutation.isPending}
            className="gap-2"
            data-testid="button-submit"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Generate
          </Button>
        </div>
      </div>
    </div>
  );

  const EditorPanel = (
    <div className="h-full flex flex-col glass-panel rounded-xl overflow-hidden border-primary/20">
      <div className="h-12 border-b border-white/5 bg-black/20 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Generated Code</span>
          {selectedProvider && (
            <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded" data-testid="text-provider-name">
              via {selectedProvider.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyCode}
            className="gap-2 h-8"
            data-testid="button-copy-code"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
          {!isMobile && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsYoutubePanelOpen(!isYoutubePanelOpen)}
              className="gap-2 h-8"
              data-testid="button-toggle-youtube"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              {isYoutubePanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1" data-testid="monaco-editor-container">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          theme="vs-dark"
          value={editorContent}
          onChange={(value) => setEditorContent(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );

  const YoutubePanel = (
    <div className="h-full flex flex-col glass-panel rounded-xl overflow-hidden" data-testid="youtube-panel">
      <div className="h-12 border-b border-white/5 bg-black/20 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Youtube className="w-4 h-4 text-red-500" />
          <span className="font-semibold text-sm">Tutorial Video</span>
        </div>
        {isMobile && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsYoutubePanelOpen(false)}
            className="h-8 w-8 p-0"
            data-testid="button-close-youtube-mobile"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="p-3 border-b border-white/5">
        <div className="flex gap-2">
          <Input
            value={youtubeInputValue}
            onChange={(e) => setYoutubeInputValue(e.target.value)}
            placeholder="Paste YouTube URL..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLoadYoutubeVideo();
              }
            }}
            data-testid="input-youtube-url"
          />
          <Button
            size="sm"
            onClick={handleLoadYoutubeVideo}
            className="px-3"
            data-testid="button-load-youtube"
          >
            Load
          </Button>
          {currentVideoId && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearYoutubeVideo}
              className="px-2"
              data-testid="button-clear-youtube"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-black/50 flex items-center justify-center" data-testid="youtube-player-container">
        {currentVideoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${currentVideoId}`}
            title="YouTube Tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            data-testid="youtube-iframe"
          />
        ) : (
          <div className="text-center text-muted-foreground p-8" data-testid="youtube-empty-state">
            <Youtube className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-sm">No video loaded</p>
            <p className="text-xs mt-1">Paste a YouTube URL above to watch tutorials while coding</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Layout>
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
          <div className="flex-1 min-h-0 flex flex-col gap-4">
            {ChatPanel}
          </div>
          
          <div className="flex-1 min-h-0">
            {EditorPanel}
          </div>

          {!isYoutubePanelOpen ? (
            <Button
              onClick={() => setIsYoutubePanelOpen(true)}
              className="gap-2"
              variant="outline"
              data-testid="button-open-youtube-mobile"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              Open Tutorial Video
            </Button>
          ) : (
            <div className="flex-1 min-h-[300px]">
              {YoutubePanel}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/5 flex flex-col gap-4">
          {ChatPanel}
        </div>

        <div className="flex-1">
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full rounded-xl"
            data-testid="resizable-panel-group"
          >
            <ResizablePanel defaultSize={isYoutubePanelOpen ? 60 : 100} minSize={30} data-testid="resizable-editor-panel">
              {EditorPanel}
            </ResizablePanel>
            
            {isYoutubePanelOpen && (
              <>
                <ResizableHandle withHandle data-testid="resizable-handle" />
                <ResizablePanel defaultSize={40} minSize={25} data-testid="resizable-youtube-panel">
                  {YoutubePanel}
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </Layout>
  );
}
