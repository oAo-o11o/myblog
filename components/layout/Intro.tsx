/**
 * 进站画面：服务端渲染，CSS 自己走完时序。
 *
 * 为什么不用客户端组件：客户端组件要等 hydration 才挂载，
 * 网慢时首页会先画出来，然后这块遮罩才「啪」一下盖上去。
 * 现在它就在 HTML 里，第一帧就在，不会有闪动。
 *
 * 什么时候不显示（由 layout 里的内联脚本提前判定，写进 html[data-intro="skip"]）：
 * - 同一会话已经看过
 * - 后台页面
 * - 系统开了「减少动态效果」
 * - 地址带 ?nointro
 */
export default function Intro({ nameEn }: { nameEn: string }) {
  const now = new Date()
  const dateLine = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join(' — ')

  const title = '思考角落'

  return (
    <div className="intro-overlay" aria-hidden="true">
      <div
        className="intro-frame font-mono text-[0.5rem] uppercase tracking-[0.34em] text-ink-dim"
        data-pos="top"
      >
        <span>{dateLine}</span>
        <span>{nameEn}</span>
      </div>

      <div className="intro-center">
        <div className="intro-title type-display-2 !text-[1.75rem] text-ink md:!text-[2.25rem]">
          {[...title].map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              className="intro-char"
              style={{ animationDelay: `${0.2 + i * 0.12}s` }}
            >
              {ch}
            </span>
          ))}
        </div>

        <div className="intro-sub mt-5 font-mono text-[0.5625rem] uppercase tracking-[0.42em] text-ink-dim">
          人生朝露 · 科技千秋
        </div>

        <div className="intro-sweep" />
      </div>

      <div
        className="intro-frame font-mono text-[0.5rem] uppercase tracking-[0.34em] text-ink-muted"
        data-pos="bottom"
      >
        <span>做想做的事</span>
        <span>坦荡迎接死亡</span>
      </div>
    </div>
  )
}
