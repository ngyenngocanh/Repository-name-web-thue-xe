import{h as l}from"./html2pdf-64589ea6.js";const c=async t=>{var e;if(!t||!t.contract)return;const n=document.createElement("div");n.style.padding="40px",n.style.color="#000",n.style.fontFamily='"Times New Roman", Times, serif',n.style.lineHeight="1.6",n.style.fontSize="12pt";const i=t.contract.agreedAt?new Date(t.contract.agreedAt):new Date,a=String(i.getDate()).padStart(2,"0"),g=String(i.getMonth()+1).padStart(2,"0"),o=i.getFullYear(),h=t.contract.contractType==="driver"?"Lái Xe":"Cộng Tác Viên";n.innerHTML=`
    <div style="text-align: center; margin-bottom: 20px;">
      <h3 style="margin: 0; font-size: 14pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
      <h4 style="margin: 0; text-decoration: underline; font-size: 13pt;">Độc lập - Tự do - Hạnh phúc</h4>
    </div>
    
    <div style="text-align: center; margin-bottom: 30px; margin-top: 40px;">
      <h2 style="margin: 0; font-size: 18pt;">HỢP ĐỒNG NGUYÊN TẮC HỢP TÁC</h2>
      <p style="margin: 5px 0; font-style: italic;">Số: ${t._id.substring(0,8).toUpperCase()}-${o} /HĐHT</p>
    </div>

    <p style="text-align: right; font-style: italic;">TP. Hồ Chí Minh, ngày ${a} tháng ${g} năm ${o}</p>

    <p>Hôm nay, thông qua hệ thống định danh điện tử của Nền tảng Web Thuê Xe, hai bên bao gồm:</p>

    <h4 style="margin-top: 15px; margin-bottom: 5px; font-size: 13pt;">BÊN A (NỀN TẢNG CUNG CẤP DỊCH VỤ):</h4>
    <ul style="list-style-type: none; padding-left: 0; margin-top: 0;">
      <li>- <strong>Tên hệ thống:</strong> Nền tảng Công nghệ Web Thuê Xe</li>
      <li>- <strong>Đại diện pháp lý:</strong> Công ty TNHH Web Thuê Xe VN</li>
      <li>- <strong>Địa chỉ:</strong> Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh</li>
    </ul>

    <h4 style="margin-top: 20px; margin-bottom: 5px; font-size: 13pt;">BÊN B (ĐỐI TÁC ${h.toUpperCase()}):</h4>
    <ul style="list-style-type: none; padding-left: 0; margin-top: 0;">
      <li>- <strong>Họ và tên:</strong> ${t.fullName.toUpperCase()}</li>
      <li>- <strong>Số CCCD/CMND:</strong> ${((e=t.idCard)==null?void 0:e.number)||"..........................................."}</li>
      <li>- <strong>Số điện thoại:</strong> ${t.phone||"..........................................."}</li>
      <li>- <strong>Email:</strong> ${t.email}</li>
    </ul>

    <p>Hai bên cùng thống nhất ký kết Hợp đồng nguyên tắc hợp tác này tuân theo các điều khoản sau đây:</p>

    <h4 style="margin-top: 15px; margin-bottom: 5px;">ĐIỀU 1: PHẠM VI HỢP TÁC</h4>
    <p style="margin-top: 5px; text-align: justify;">Bên B đăng ký tham gia trở thành đối tác ${h} trên nền tảng của Bên A. Bên B cung cấp nhân lực hoặc nguồn xe và nhận chiết khấu/thu nhập theo các thỏa thuận và chính sách hiện hành được công bố trên nền tảng.</p>

    <h4 style="margin-top: 15px; margin-bottom: 5px;">ĐIỀU 2: QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</h4>
    <ul style="margin-top: 5px; text-align: justify; padding-left: 20px;">
      <li>Cung cấp và duy trì ổn định ứng dụng phần mềm kết nối đa nền tảng để hỗ trợ Bên B phục vụ khách hàng.</li>
      <li>Xử lý tự động các khoản doanh thu hợp lệ và chi trả định kỳ vào tài khoản ngân hàng do Bên B cung cấp.</li>
      <li>Toàn quyền ngưng cung cấp dịch vụ hoặc hạn chế tài khoản của Bên B nếu phát hiện Bên B có hành vi vi phạm an toàn, pháp luật hoặc gây thiệt hại uy tín nền tảng.</li>
    </ul>

    <h4 style="margin-top: 15px; margin-bottom: 5px;">ĐIỀU 3: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</h4>
    <ul style="margin-top: 5px; text-align: justify; padding-left: 20px;">
      <li>Đảm bảo mọi thông tin cá nhân, giấy tờ định danh cung cấp trên hệ thống là hoàn toàn chính xác và hợp pháp hợp lệ.</li>
      <li>Bảo mật thông tin khách hàng. Tuân thủ nghiêm ngặt quy tắc an toàn giao thông đường bộ và các thủ tục dân sự liên quan đến khai thác dịch vụ.</li>
      <li>Thái độ tôn trọng, chuyên nghiệp và có trách nhiệm hoàn trả đầy đủ các khoản bồi thường nếu phát sinh lỗi chủ quan từ phía mình.</li>
    </ul>

    <h4 style="margin-top: 15px; margin-bottom: 5px;">ĐIỀU 4: ĐIỀU KHOẢN CHUNG VÀ CHỮ KÝ ĐIỆN TỬ</h4>
    <p style="margin-top: 5px; text-align: justify;">Các tranh chấp phát sinh từ hoặc liên quan tới Hợp đồng này sẽ được hai bên nỗ lực thương lượng giải quyết. Trường hợp không thỏa thuận được sẽ đưa ra giải quyết tại Tòa án cấp có thẩm quyền quản lý.<br>
    Hợp đồng xác nhận tính rành buộc pháp lý thông qua sự đồng thuận Chữ ký điện tử theo Luật Giao dịch Điện tử VN.</p>
    
    <div style="display: flex; justify-content: space-between; margin-top: 50px;">
      <div style="width: 45%; text-align: center;">
        <h4 style="margin-bottom: 50px;">ĐẠI DIỆN BÊN A</h4>
        <p style="color: red; border: 2px solid red; display: inline-block; padding: 10px; border-radius: 50%; font-weight: bold; transform: rotate(-15deg); margin-bottom: 20px;">ĐÃ PHÊ DUYỆT<br>TRÊN HỆ THỐNG</p>
        <p><strong>CÔNG TY TNHH WEB THUÊ XE</strong></p>
      </div>
      <div style="width: 45%; text-align: center;">
        <h4 style="margin-bottom: 50px;">ĐẠI DIỆN BÊN B</h4>
        <div style="font-family: 'Brush Script MT', 'Dancing Script', cursive; font-size: 24pt; color: #000080; margin-bottom: 20px;">
          ${t.contract.signatureName}
        </div>
        <p><strong>Họ tên: ${t.contract.signatureName.toUpperCase()}</strong></p>
        <p style="font-size: 10pt; color: #555; background: #eee; border: 1px dashed #ccc; padding: 5px; border-radius: 4px; display: inline-block;">
          Dấu thời gian số hóa:<br>
          ${i.toLocaleString("vi-VN")}
        </p>
      </div>
    </div>
  `;const p={margin:10,filename:`HopDong_${h}_${t.fullName.replace(/\s+/g,"")}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};l().set(p).from(n).save()};export{c as g};
//# sourceMappingURL=contractGenerator-4be71e9d.js.map
