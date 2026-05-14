// Quản lý hợp đồng điện tử
const fs = require('fs');
const path = require('path');
const generateSelfDriveContract = require('./selfDriveContract');
const generateWithDriverContract = require('./withDriverContract');
const generateTripDriverContract = require('./tripDriverContract');

class ContractManager {
  constructor() {
    this.contractsDir = path.join(__dirname, '../../uploads/contracts');
    this.ensureContractsDir();
  }

  ensureContractsDir() {
    if (!fs.existsSync(this.contractsDir)) {
      fs.mkdirSync(this.contractsDir, { recursive: true });
    }
  }

  generateContractId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `HD${timestamp}${random}`;
  }

  // Tạo hợp đồng thuê xe tự lái
  async generateSelfDriveContract(data) {
    try {
      const contractId = this.generateContractId();
      const contractContent = generateSelfDriveContract({
        ...data,
        contractId
      });

      const fileName = `self-drive-${contractId}.txt`;
      const filePath = path.join(this.contractsDir, fileName);

      fs.writeFileSync(filePath, contractContent, 'utf8');

      return {
        success: true,
        contractId,
        fileName,
        filePath,
        content: contractContent
      };
    } catch (error) {
      console.error('Error generating self-drive contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Tạo hợp đồng thuê xe kèm tài xế
  async generateWithDriverContract(data) {
    try {
      const contractId = this.generateContractId();
      const contractContent = generateWithDriverContract({
        ...data,
        contractId
      });

      const fileName = `with-driver-${contractId}.txt`;
      const filePath = path.join(this.contractsDir, fileName);

      fs.writeFileSync(filePath, contractContent, 'utf8');

      return {
        success: true,
        contractId,
        fileName,
        filePath,
        content: contractContent
      };
    } catch (error) {
      console.error('Error generating with-driver contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Tạo hợp đồng thuê tài xế theo chuyến
  async generateTripDriverContract(data) {
    try {
      const contractId = this.generateContractId();
      const contractContent = generateTripDriverContract({
        ...data,
        contractId
      });

      const fileName = `trip-driver-${contractId}.txt`;
      const filePath = path.join(this.contractsDir, fileName);

      fs.writeFileSync(filePath, contractContent, 'utf8');

      return {
        success: true,
        contractId,
        fileName,
        filePath,
        content: contractContent
      };
    } catch (error) {
      console.error('Error generating trip-driver contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy nội dung hợp đồng
  getContractContent(fileName) {
    try {
      const filePath = path.join(this.contractsDir, fileName);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error('Error reading contract:', error);
      return null;
    }
  }

  // Lấy danh sách hợp đồng
  getContractList() {
    try {
      const files = fs.readdirSync(this.contractsDir);
      return files.filter(file => file.endsWith('.txt')).map(file => {
        const stats = fs.statSync(path.join(this.contractsDir, file));
        return {
          fileName: file,
          createdAt: stats.birthtime,
          size: stats.size
        };
      });
    } catch (error) {
      console.error('Error listing contracts:', error);
      return [];
    }
  }

  // Xóa hợp đồng
  deleteContract(fileName) {
    try {
      const filePath = path.join(this.contractsDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting contract:', error);
      return false;
    }
  }

  // Tạo hợp đồng dựa trên loại dịch vụ
  async generateContract(serviceType, data) {
    switch (serviceType) {
      case 'self-drive':
        return this.generateSelfDriveContract(data);
      case 'with-driver':
        return this.generateWithDriverContract(data);
      case 'trip-driver':
        return this.generateTripDriverContract(data);
      default:
        return {
          success: false,
          error: 'Loại dịch vụ không hợp lệ'
        };
    }
  }
}

module.exports = new ContractManager();