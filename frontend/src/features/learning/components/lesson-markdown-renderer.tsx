"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/shared/utils/cn";
import { getBlockComponent } from "./blocks/block-registry";

interface LessonMarkdownRendererProps {
  content: string;
  className?: string;
}

export function LessonMarkdownRenderer({ content, className }: LessonMarkdownRendererProps) {
  return (
    <div className={cn("prose prose-slate dark:prose-invert max-w-none text-on-surface-variant leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Custom fenced block components interception
          code({ inline, className: codeClassName, children, ...props }: any) {
            const match = /language-(\S+)/.exec(codeClassName || "");
            const lang = match ? match[1] : "";
            const component = getBlockComponent(lang);

            if (component) {
              const textContent = String(children).replace(/\n$/, "");
              const SelectedComponent = component;
              return <SelectedComponent content={textContent} {...props} />;
            }

            return inline ? (
              <code className={cn("bg-surface-low px-1.5 py-0.5 rounded font-mono text-sm text-primary", codeClassName)} {...props}>
                {children}
              </code>
            ) : (
              <pre className="overflow-x-auto p-4 bg-[#0d0d0d] border border-white/10 rounded-xl font-mono text-sm text-white/90 my-4 shadow-inner">
                <code className={codeClassName} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          // Format headers
          h1({ className: hClassName, children, ...props }) {
            return (
              <h1 className={cn("text-2xl font-bold text-on-surface mt-8 mb-4 border-b border-border-light pb-2", hClassName)} {...props}>
                {children}
              </h1>
            );
          },
          h2({ className: hClassName, children, ...props }) {
            return (
              <h2 className={cn("text-xl font-semibold text-on-surface mt-6 mb-3", hClassName)} {...props}>
                {children}
              </h2>
            );
          },
          h3({ className: hClassName, children, ...props }) {
            return (
              <h3 className={cn("text-lg font-medium text-on-surface mt-5 mb-2", hClassName)} {...props}>
                {children}
              </h3>
            );
          },
          // Format blockquotes
          blockquote({ className: bClassName, children, ...props }) {
            return (
              <blockquote className={cn("border-l-4 border-primary pl-4 my-6 text-on-surface-variant italic bg-primary/5 py-2 pr-2 rounded-r-lg", bClassName)} {...props}>
                {children}
              </blockquote>
            );
          },
          // Format lists
          ul({ className: lClassName, children, ...props }) {
            return (
              <ul className={cn("space-y-2 my-4 ml-6 list-disc list-outside marker:text-primary", lClassName)} {...props}>
                {children}
              </ul>
            );
          },
          ol({ className: lClassName, children, ...props }) {
            return (
              <ol className={cn("space-y-2 my-4 ml-6 list-decimal list-outside marker:text-primary", lClassName)} {...props}>
                {children}
              </ol>
            );
          },
          li({ className: liClassName, children, ...props }) {
            return (
              <li className={cn("text-on-surface-variant leading-relaxed", liClassName)} {...props}>
                {children}
              </li>
            );
          },
          // Format paragraphs
          p({ className: pClassName, children, ...props }) {
            return (
              <p className={cn("my-3 text-on-surface-variant leading-relaxed", pClassName)} {...props}>
                {children}
              </p>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
