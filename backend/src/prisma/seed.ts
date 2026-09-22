import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../config/database';

async function main() {
  const matKhau = await bcrypt.hash('123456', 10);

  const nhanVien = await prisma.nguoiDung.upsert({
    where: { taiKhoan: 'nhanvien' },
    update: { hoTen: 'Nhân viên demo', matKhau, vaiTro: 'nhanvien', trangThai: true },
    create: { hoTen: 'Nhân viên demo', taiKhoan: 'nhanvien', matKhau, vaiTro: 'nhanvien' },
  });

  await prisma.nguoiDung.upsert({
    where: { taiKhoan: 'admin' },
    update: { hoTen: 'Quản trị viên demo', matKhau, vaiTro: 'admin', trangThai: true },
    create: { hoTen: 'Quản trị viên demo', taiKhoan: 'admin', matKhau, vaiTro: 'admin' },
  });

  const sanPhamMau = [
    { ten: 'Nước suối Aquafina', thuongHieu: 'Aquafina', danhMuc: 'Đồ uống', giaTri: 500, donVi: 'ml', giaBan: 7000, soLuongTon: 100 },
    { ten: 'Mì Hảo Hảo tôm chua cay', thuongHieu: 'Acecook', danhMuc: 'Thực phẩm', giaTri: 75, donVi: 'gói', giaBan: 5000, soLuongTon: 80 },
    { ten: 'Bột giặt OMO', thuongHieu: 'OMO', danhMuc: 'Gia dụng', giaTri: 3, donVi: 'kg', giaBan: 115000, soLuongTon: 25 },
  ];

  for (const item of sanPhamMau) {
    const sanPham = await prisma.sanPham.findFirst({ where: { ten: item.ten } });
    const product = sanPham ?? await prisma.sanPham.create({
      data: { ten: item.ten, thuongHieu: item.thuongHieu, danhMuc: item.danhMuc },
    });

    const bienThe = await prisma.bienThe.findFirst({ where: { sanPhamId: product.id, donVi: item.donVi, giaTri: item.giaTri } });
    if (bienThe) {
      await prisma.bienThe.update({ where: { id: bienThe.id }, data: { giaBan: item.giaBan, soLuongTon: item.soLuongTon, trangThai: true } });
    } else {
      await prisma.bienThe.create({
        data: { sanPhamId: product.id, giaTri: item.giaTri, donVi: item.donVi, giaNhap: Math.round(item.giaBan * 0.7), giaBan: item.giaBan, soLuongTon: item.soLuongTon },
      });
    }
  }

  await prisma.khachHang.upsert({
    where: { id: 1 },
    update: { ten: 'Khách lẻ demo', sdt: '0900000000' },
    create: { ten: 'Khách lẻ demo', sdt: '0900000000' },
  }).catch(async () => {
    const existing = await prisma.khachHang.findFirst({ where: { sdt: '0900000000' } });
    if (!existing) await prisma.khachHang.create({ data: { ten: 'Khách lẻ demo', sdt: '0900000000' } });
  });

  console.log(`Seed hoàn tất. Đăng nhập nhân viên: nhanvien / 123456 (id=${nhanVien.id})`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
