// Hợp đồng điện tử cho thuê xe tự lái - Phiên bản chuyên nghiệp
module.exports = function generateSelfDriveContract({
  renter,
  owner,
  car,
  booking,
  startDate,
  endDate,
  contractId
}) {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  
  const startDateFormatted = new Date(startDate).toLocaleDateString('vi-VN');
  const endDateFormatted = new Date(endDate).toLocaleDateString('vi-VN');

  return `
                                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                                        Độc lập - Tự do - Hạnh phúc
                                    -------------------------------------



                                    HỢP ĐỒNG CHO THUÊ XE TỰ LÁI
                                      (Số: ${contractId || booking._id}/HĐTX)




CHÚNG TÔI GỒM CÓ:

BÊN CHO THUÊ XE (gọi tắt là "Bên A"):
    - Tên công ty/doanh nghiệp/cá nhân: ${owner.businessName || owner.fullName || '_________________'}
    - Người đại diện: ${owner.fullName || '_________________'}
    - Chức vụ: Chủ sở hữu xe/Đại diện hợp pháp
    - Địa chỉ: ${owner.address || '_________________'}
    - Số điện thoại: ${owner.phone || '_________________'}
    - Email: ${owner.email || '_________________'}
    - Số CMND/CCCD: ${owner.idCard?.number || owner.idCard || '_________________'}
    - Mã số thuế (nếu có): ${owner.taxCode || '_________________'}

VÀ

BÊN THUÊ XE (gọi tắt là "Bên B"):
    - Họ và tên: ${renter.fullName || '_________________'}
    - Ngày sinh: ${renter.dateOfBirth || '_________________'}
    - Số CMND/CCCD: ${renter.idCard?.number || renter.idCard || '_________________'}
    - Ngày cấp: ${renter.idCardIssueDate || '_________________'}     Nơi cấp: ${renter.idCardIssuePlace || '_________________'}
    - Hộ khẩu thường trú: ${renter.permanentAddress || renter.address || '_________________'}
    - Địa chỉ hiện tại: ${renter.address || '_________________'}
    - Số điện thoại: ${renter.phone || '_________________'}
    - Email: ${renter.email || '_________________'}
    - Số GPLX: ${renter.driverLicense || renter.drivingLicense || '_________________'}     Hạng: ${renter.licenseClass || '_________________'}


Hai bên cùng thỏa thuận ký kết Hợp đồng cho thuê xe tự lái (gọi tắt là "Hợp đồng") 
với các điều khoản và điều kiện cụ thể như sau:


ĐIỀU 1. ĐỐI TƯỢNG CỦA HỢP ĐỒNG

1.1.  Bên A đồng ý cho Bên B thuê và Bên B đồng ý thuê phương tiện ô tô với 
các thông số kỹ thuật và tính năng sau:

    + Hãng sản xuất: ${car.brand || '_________________'}
    + Dòng xe: ${car.model || '_________________'}
    + Năm sản xuất: ${car.year || '_________________'}
    + Màu sắc: ${car.color || '_________________'}
    + Biển số đăng ký: ${car.licensePlate || '_________________'}
    + Số khung (VIN): ${car.vin || car.frameNumber || '_________________'}
    + Số máy: ${car.engineNumber || '_________________'}
    + Số chỗ ngồi: ${car.seats || '_________________'} chỗ
    + Loại nhiên liệu: ${car.fuelType || 'Xăng/Dầu'}
    + Tiêu thụ nhiên liệu: ${car.fuelConsumption || '_____'} lít/100km
    + Tình trạng xe khi bàn giao: ${car.condition || 'Tốt'}

1.2.  Xe trên thuộc quyền sở hữu hợp pháp của Bên A, không có tranh chấp, 
khiếu nại hoặc kê biên từ cơ quan có thẩm quyền.


ĐIỀU 2. THỜI HẠN VÀ MỤC ĐÍCH THUÊ XE

2.1.  Thời hạn thuê xe: Từ ${startDateFormatted} đến ${endDateFormatted}
      (Tổng cộng: ${booking.duration?.days || booking.totalDays || Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} ngày)

2.2.  Mục đích thuê xe: Để phục vụ nhu cầu đi lại cá nhân/công việc của Bên B.
      Bên B cam kết KHÔNG sử dụng xe vào các mục đích:
      - Vận chuyển hàng hóa vi phạm pháp luật, hàng cấm
      - Tham gia đua xe, lạng lách, đánh võng
      - Cầm cố, thế chấp hoặc cho thuê lại
      - Sử dụng vào mục đích kinh doanh vận tải


ĐIỀU 3. GIÁ TRỊ HỢP ĐỒNG VÀ PHƯƠNG THỨC THANH TOÁN

3.1.  Giá trị Hợp đồng được tính như sau:

      a) Giá thuê xe: ${new Intl.NumberFormat('vi-VN').format(booking.pricing?.dailyRate || booking.pricing?.baseRentalFee || 0)} VNĐ/ngày
      
      b) Số ngày thuê: ${booking.duration?.days || booking.totalDays || '_____'} ngày
      
      c) Tổng tiền thuê xe (a x b): ${new Intl.NumberFormat('vi-VN').format(booking.pricing?.totalRentalFee || 0)} VNĐ
         (Bằng chữ: ${numberToWords(booking.pricing?.totalRentalFee || 0)} đồng chẵn)
      
      d) Phụ phí (nếu có): ${new Intl.NumberFormat('vi-VN').format(booking.pricing?.additionalFees || booking.extraFee || 0)} VNĐ
      
      e) Bảo hiểm thuê xe: ${new Intl.NumberFormat('vi-VN').format(booking.pricing?.insuranceFee || 0)} VNĐ
      
      f) Tổng giá trị Hợp đồng (c + d + e): ${new Intl.NumberFormat('vi-VN').format(booking.pricing?.totalAmount || booking.pricing?.totalRentalFee || 0)} VNĐ
         (Bằng chữ: ${numberToWords(booking.pricing?.totalAmount || booking.pricing?.totalRentalFee || 0)} đồng chẵn)

3.2.  Chiết khấu Cộng tác viên (CTV):
      - Tỷ lệ hoa hồng CTV: 30% trên tổng tiền thuê xe (mục c).
      - Số tiền hoa hồng CTV: ${new Intl.NumberFormat('vi-VN').format(Math.round((booking.pricing?.totalRentalFee || 0) * 0.3))} VNĐ.
      - (Nội dung này được ghi nhận như một phần cam kết dịch vụ cho người giới thiệu).

3.2.  Tiền đặt cọc: ${new Intl.NumberFormat('vi-VN').format(booking.pricing?.deposit || 0)} VNĐ
      (Thanh toán khi nhận xe)

3.3.  Số tiền còn lại phải thanh toán: ${new Intl.NumberFormat('vi-VN').format((booking.pricing?.totalAmount || booking.pricing?.totalRentalFee || 0) - (booking.pricing?.deposit || 0))} VNĐ

3.4.  Phương thức thanh toán: 
      [${booking.payment?.method === 'cash' ? 'X' : ' '}] Tiền mặt
      [${booking.payment?.method === 'bank_transfer' ? 'X' : ' '}] Chuyển khoản ngân hàng
      [${booking.payment?.method === 'vnpay' ? 'X' : ' '}] VNPay
      [${booking.payment?.method === 'payos' ? 'X' : ' '}] PayOS


ĐIỀU 4. THỜI GIAN, ĐỊA ĐIỂM GIAO NHẬN XE

4.1.  Thời gian giao xe: ${booking.pickupTime || '_____'} ngày ${startDateFormatted}
4.2.  Địa điểm giao xe: ${booking.pickupLocation || booking.pickupAddress?.fullAddress || '_________________'}

4.3.  Thời gian nhận lại xe: ${booking.returnTime || '_____'} ngày ${endDateFormatted}
4.4.  Địa điểm nhận lại xe: ${booking.returnLocation || booking.returnAddress?.fullAddress || booking.pickupLocation || '_________________'}


ĐIỀU 5. QUYỀN VÀ NGHĨA VỤ CỦA BÊN A

5.1.  Quyền của Bên A:
      a) Nhận đủ tiền thuê xe theo thỏa thuận;
      b) Kiểm tra tình trạng xe khi nhận lại;
      c) Yêu cầu Bên B bồi thường thiệt hại nếu có;
      d) Đơn phương chấm dứt Hợp đồng nếu Bên B vi phạm nghiêm trọng.

5.2.  Nghĩa vụ của Bên A:
      a) Giao xe đúng thời hạn, địa điểm, chất lượng như cam kết;
      b) Cung cấp đầy đủ giấy tờ xe: Đăng ký, Đăng kiểm, Bảo hiểm;
      c) Bảo đảm xe không có tranh chấp, khiếu kiện;
      d) Chịu trách nhiệm pháp lý về nguồn gốc xe;
      e) Hỗ trợ kỹ thuật trong thời gian thuê (nếu cần).


ĐIỀU 6. QUYỀN VÀ NGHĨA VỤ CỦA BÊN B

6.1.  Quyền của Bên B:
      a) Sử dụng xe đúng mục đích, thời hạn thỏa thuận;
      b) Yêu cầu Bên A giao xe đúng chất lượng;
      c) Được Bên A hỗ trợ khi xe gặp sự cố;
      d) Nhận lại tiền đặt cọc sau khi trả xe đúng hạn, đúng tình trạng.

6.2.  Nghĩa vụ của Bên B:
      a) Thanh toán đầy đủ, đúng hạn các khoản tiền theo Hợp đồng;
      b) Xuất trình GPLX hợp lệ, đúng hạng lái xe;
      c) Kiểm tra kỹ xe trước khi nhận và ký biên bản bàn giao;
      d) Sử dụng xe an toàn, đúng luật giao thông;
      e) Không tự ý sửa chữa, thay đổi kết cấu xe;
      f) Chịu phạt nguội, vi phạm giao thông phát sinh;
      g) Trả xe đúng thời hạn, địa điểm, tình trạng như khi nhận;
      h) Bồi thường thiệt hại do lỗi của mình gây ra.


ĐIỀU 7. PHẠT VI PHẠM VÀ BỒI THƯỜNG THIỆT HẠI

7.1.  Trả xe muộn:
      - Trễ 01-03 giờ: Phạt 20% giá thuê/ngày
      - Trễ 03-06 giờ: Phạt 50% giá thuê/ngày
      - Trễ trên 06 giờ: Tính thêm 01 ngày thuê

7.2.  Vi phạm giao thông: Bên B chịu hoàn toàn trách nhiệm và chi phí.

7.3.  Hư hỏng xe:
      - Do lỗi chủ quan: Bên B bồi thường 100% chi phí sửa chữa
      - Mất xe/bộ phận xe: Bên B bồi thường theo giá trị thực tế

7.4.  Sai mục đích sử dụng: Phạt 50% giá trị Hợp đồng.


ĐIỀU 8. BẢO HIỂM

8.1.  Xe đã được mua bảo hiểm bắt buộc TNDS bên thứ ba.

8.2.  Bên B có thể mua thêm bảo hiểm tự nguyện cho thời gian thuê.

8.3.  Tai nạn xảy ra: Bên B phải:
      - Dừng xe, bảo vệ hiện trường;
      - Báo ngay cho Bên A và cơ quan công an;
      - Hợp tác giải quyết theo quy định pháp luật.


ĐIỀU 9. CHẤM DỨT HỢP ĐỒNG

9.1.  Hợp đồng chấm dứt khi:
      a) Hết thời hạn thuê;
      b) Hai bên thỏa thuận chấm dứt;
      c) Một bên vi phạm nghiêm trọng;
      d) Bất khả kháng.

9.2.  Chấm dứt sớm: Thanh toán theo ngày thực tế + phí chấm dứt 20%.


ĐIỀU 10. GIẢI QUYẾT TRANH CHẤP

10.1. Ưu tiên giải quyết thông qua thương lượng.

10.2. Không thành: Yêu cầu Trung tâm Trọng tài/ Tòa án có thẩm quyền.

10.3. Áp dụng pháp luật Việt Nam.


ĐIỀU 11. CAM KẾT CHUNG

11.1. Hai bên cam kết thực hiện đúng các điều khoản.

11.2. Mọi thay đổi phải được lập thành văn bản phụ lục.

11.3. Phụ lục là bộ phận không tách rời của Hợp đồng.


ĐIỀU 12. HIỆU LỰC HỢP ĐỒNG

12.1. Hợp đồng có hiệu lực từ ngày ký.

12.2. Lập thành 02 (hai) bản, mỗi bên giữ 01 (một) bản có giá trị như nhau.





                                              Ngày ${day} tháng ${month} năm ${year}




    BÊN CHO THUÊ XE (BÊN A)                BÊN THUÊ XE (BÊN B)
      (Ký, ghi rõ họ tên)                     (Ký, ghi rõ họ tên)




    ${owner.fullName || '_________________'}                      ${renter.fullName || '_________________'}





--------------------------------------------------------------------------------
HỢP ĐỒNG ĐIỆN TỬ - Có giá trị pháp lý theo Luật Giao dịch điện tử số 21/2023/QH15
Mã hợp đồng: ${contractId || booking._id} | Thời gian tạo: ${currentDate.toLocaleString('vi-VN')}
`;
};

// Hàm chuyển số thành chữ (simplified)
function numberToWords(num) {
  if (!num || num === 0) return 'Không';
  
  const ones = ['', 'Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín'];
  const tens = ['', 'Mười', 'Hai mươi', 'Ba mươi', 'Bốn mươi', 'Năm mươi', 'Sáu mươi', 'Bảy mươi', 'Tám mươi', 'Chín mươi'];
  
  if (num < 10) return ones[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (one === 0) return tens[ten];
    if (ten === 1 && one === 5) return 'Mười lăm';
    return tens[ten] + ' ' + ones[one];
  }
  
  // For larger numbers, return formatted number
  if (num >= 1000000000) {
    return new Intl.NumberFormat('vi-VN').format(num / 1000000000).replace(/,/g, '.') + ' tỷ';
  }
  if (num >= 1000000) {
    return new Intl.NumberFormat('vi-VN').format(num / 1000000).replace(/,/g, '.') + ' triệu';
  }
  if (num >= 1000) {
    return new Intl.NumberFormat('vi-VN').format(num / 1000).replace(/,/g, '.') + ' nghìn';
  }
  
  return new Intl.NumberFormat('vi-VN').format(num).replace(/,/g, '.');
}
