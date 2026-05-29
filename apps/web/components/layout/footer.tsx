export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <p className="font-semibold text-ink">VietFly Agency</p>
          <p>Nền tảng bán vé máy bay cho đại lý Việt Nam.</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Hỗ trợ</p>
          <p>Hotline: 1900 8888</p>
          <p>Email: support@vietfly.vn</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Chính sách</p>
          <p>Điều kiện vé, hoàn hủy, bảo mật thanh toán.</p>
        </div>
      </div>
    </footer>
  );
}
