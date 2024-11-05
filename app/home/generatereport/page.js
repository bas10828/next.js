"use client";
import React, { useState } from 'react';
import readXlsxFile from 'read-excel-file';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { Container, Typography, Button, TextField, Table,Input, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';

const Generatereport = () => {
    const [projectData, setProjectData] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [report, setReport] = useState('');


    const handleFileUpload = (event, fileType) => {
        const file = event.target.files[0];
        if (!file || !file.name.endsWith('.xlsx')) {
            alert("กรุณาเลือกไฟล์ .xlsx เท่านั้น");
            return;
        }
        readXlsxFile(file).then((rows) => {
            if (fileType === 'project') {
                setProjectData(rows);
            } else if (fileType === 'inventory') {
                setInventoryData(rows);
            }
        }).catch((error) => console.error("เกิดข้อผิดพลาดในการอ่านไฟล์:", error));
    };


    const generateReport = () => {
        let reportText = '';
        let currentBuilding = null;
        let buildingIndex = 1; // สำหรับการแสดงลำดับอาคาร
        let subItemIndex = 1; // ตัวแปรสำหรับหมายเลขย่อย

        // สร้างรายงานจาก Project Data
        projectData.forEach((row) => {
            const [no, detail, quantity, unit] = row;

            // ข้ามการแสดงแถวที่มี no เป็น "ลำดับ"
            if (no === "ลำดับ") {
                return; // ข้ามไปยังแถวถัดไป
            }

            // ตรวจสอบหาชื่ออาคาร โดยใช้เลขลำดับในช่อง "ลำดับ"
            if (no && detail) {
                currentBuilding = detail;
                reportText += `\n${no}. ${currentBuilding}\n`; // ใช้เลขลำดับจากช่อง "ลำดับ"
                buildingIndex++;
                subItemIndex = 1; // รีเซ็ตหมายเลขย่อยเมื่อเจออาคารใหม่
            }

            // เพิ่มรายละเอียดในรายงาน
            if (currentBuilding && detail && !no) {
                const quantityText = quantity ? `จำนวน: ${quantity} ${unit}` : 'จำนวน: ไม่ระบุ';

                if ((detail.includes("รวมติดตั้ง Access Point") || detail.includes("รวมติดตั้ง Acess Point")) && quantity === 1) {
                    const accessPoints = inventoryData.filter(
                        ([, deviceType, , , , , , , location]) =>
                            deviceType &&
                            (deviceType.toLowerCase() === "accesspoint" || deviceType.toLowerCase() === "access point") &&
                            location &&
                            location.includes(currentBuilding)
                    );
                    accessPoints.forEach(([, , brand, model, serialNumber, , deviceName, , location], index) => {
                        reportText += `${buildingIndex - 1}.${subItemIndex} ${brand} ${model} (${deviceName}) S/N: ${serialNumber}, Location: ${location}\n`;
                    });
                }

                else if (detail.includes("Switch") || detail.includes("switch")) {
                    const Switches = inventoryData.filter(
                        ([, deviceType, , , , , , , location]) =>
                            deviceType &&
                            (deviceType.toLowerCase() === "switch poe" || deviceType.toLowerCase() === "switch sfp" || deviceType.toLowerCase() === "core switch") &&
                            location &&
                            location.includes(currentBuilding)
                    );

                    // กรองให้เหลือ switch ที่มี model ตรงกับ detail
                    const matchedSwitch = Switches.find(([, , , model]) => detail.includes(model));
                    // console.log("sw", matchedSwitch)

                    if (matchedSwitch) {
                        // ถ้ามี switch ที่ตรงกับ detail ให้เพิ่มข้อมูลใน reportText
                        const [, deviceType, brand, model, serialNumber, , deviceName, , location] = matchedSwitch;

                        if (deviceType.toLowerCase() === "switch poe") {
                            reportText += `${buildingIndex - 1}.${subItemIndex} ติดตั้ง Switch POE ${brand} ${model} (${deviceName}) S/N: ${serialNumber} ${location}\n`;
                        } else if (deviceType.toLowerCase() === "switch sfp") {
                            reportText += `${buildingIndex - 1}.${subItemIndex} ติดตั้ง Switch SFP ${brand} ${model} (${deviceName}) S/N: ${serialNumber} ${location}\n`;
                        }
                    }

                }
                else if (detail.includes("Router") || detail.includes("router")) {
                    const Router = inventoryData.filter(
                        ([, deviceType, , , , , , , location]) =>
                            deviceType &&
                            deviceType.toLowerCase() === "router" &&
                            location &&
                            location.includes(currentBuilding)
                    );

                    // กรองให้เหลือ switch ที่มี model ตรงกับ detail
                    const matchedRouter = Router.find(([, , , model]) => detail.includes(model));
                    // console.log("Router", matchedRouter)

                    if (matchedRouter) {
                        // ถ้ามี switch ที่ตรงกับ detail ให้เพิ่มข้อมูลใน reportText
                        const [, , brand, model, serialNumber, , deviceName, , location] = matchedRouter;
                        reportText += `${buildingIndex - 1}.${subItemIndex} ติดตั้ง Router ${brand} ${model} (${deviceName}) S/N: ${serialNumber} ${location}\n`;
                    }

                }
                else if (detail.toLowerCase().includes("ups")) {
                    const ups = inventoryData.filter(
                        ([, deviceType, , , , , , , location]) =>
                            deviceType && deviceType.toLowerCase() === "ups" &&
                            location &&
                            location.includes(currentBuilding)
                    );

                    // ตรวจสอบ ups ที่มี model ตรงกับ detail
                    const matchedUps = ups.filter(([, , , model]) => detail.toLowerCase().includes(model.toLowerCase()));

                    // แสดงผลเฉพาะข้อมูลที่ตรงกับ model ใน detail
                    matchedUps.forEach(([, , brand, model, serialNumber, , deviceName, , location], index) => {
                        reportText += `${buildingIndex - 1}.${subItemIndex} ติดตั้ง UPS ${brand} ${model} (${deviceName}) S/N: ${serialNumber} ${location}\n`;
                    });
                }

                else if(detail.toLowerCase().includes("wall") && detail.toLowerCase().includes("rack")){
                    reportText += `${buildingIndex - 1}.${subItemIndex} ติดตั้ง${detail} ${quantityText}\n`;

                }

                else if (
                    detail.includes("รวมค่าใช้จ่ายทั้งโครงการ") ||
                    detail.includes("ภาษีมูลค่าเพิ่ม") ||
                    detail.includes("รวมค่าใช้จ่ายทั้งโครงการ") ||
                    detail.toLowerCase().includes("1.25g") ||
                    detail.toLowerCase().includes("10g") ||
                    detail.toLowerCase().includes("patch cord") ||
                    detail.toLowerCase().includes("wi-fi") ||
                    detail.toLowerCase().includes("wifi") ||
                    detail.toLowerCase().includes("wireless") ||
                    detail.toLowerCase().includes("rack mount")
                ) {
                    // ข้ามรายละเอียดที่ไม่เกี่ยวข้องกับอุปกรณ์
                    return;
                }

                else {
                    reportText += `${buildingIndex - 1}.${subItemIndex} ${detail} ${quantityText}\n`;
                }

                // ถ้าจำนวนมากกว่า 1 ให้สร้างหัวข้อย่อย
                if (quantity > 1 && (detail.includes("รวมติดตั้ง") || detail.includes("Outlet LAN") || detail.includes("Outlet"))) {
                    // เพิ่มในฟังก์ชัน generateReport หลังจากที่ตรวจสอบเงื่อนไข quantity > 1
                    if (detail.includes("รวมติดตั้ง Access Point") || detail.includes("รวมติดตั้ง Acess Point")) {
                        const accessPoints = inventoryData.filter(
                            ([, deviceType, , , , , , , location]) =>
                                deviceType &&
                                (deviceType.toLowerCase() === "accesspoint" || deviceType.toLowerCase() === "access point") &&
                                location &&
                                location.includes(currentBuilding)
                        );
                        // console.log("building",currentBuilding,accessPoints)

                        accessPoints.forEach(([, , brand, model, serialNumber, , deviceName, , location], index) => {
                            reportText += `${buildingIndex - 1}.${subItemIndex}.${index + 1} ติดตั้ง Access Point ${brand} ${model} (${deviceName}) S/N: ${serialNumber} ${location}\n`;
                        });
                    }
                    else if (detail.includes("Outlet LAN") || detail.includes("Outlet")) {
                        for (let i = 1; i <= quantity; i++) {
                            reportText += `${buildingIndex - 1}.${subItemIndex}.${i} Outlet LAN \n`;
                        }
                    }

                    else {
                        // ถ้าจำนวนมากกว่า 1 ให้สร้างหัวข้อย่อยปกติ
                        for (let i = 1; i <= quantity; i++) {
                            reportText += `${buildingIndex - 1}.${subItemIndex}.${i} ${detail}\n`;
                        }
                    }

                }

                subItemIndex++; // เพิ่มหมายเลขย่อยเมื่อมีรายละเอียด
            }
        });

        setReport(reportText);
    };



    // ฟังก์ชันสำหรับส่งออกเป็นไฟล์ Word
    const exportToWord = async () => {
        const reportSections = report.split('\n'); // Assuming report is formatted with line breaks

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "Generated Report",
                        heading: "Heading1", // Set as Heading 1
                        spacing: { after: 600 }, // Add space after the heading
                    }),
                    ...reportSections.map((section, index) => {
                        return new Paragraph({
                            text: section,
                            spacing: {
                                before: 300, // Add space before each section
                                after: 300, // Add space after each section
                            },
                        });
                    }),
                ],
            }],
        });

        try {
            const blob = await Packer.toBlob(doc); // Correct method to get blob
            saveAs(blob, "Generated_Report.docx");
        } catch (error) {
            console.error("Error while exporting to Word:", error);
            alert("เกิดข้อผิดพลาดในการส่งออกไฟล์ Word. กรุณาลองใหม่อีกครั้ง");
        }
    };



    return (
      <Container maxWidth="100%" sx={{ py: 4, bgcolor: 'grey.50', minHeight: '100vh',padding: '100px' }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
              Upload Files
          </Typography>
  
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
              <Box component={Paper} elevation={3} p={2} textAlign="center">
                  <Typography variant="h6" fontWeight="medium">
                      Project File
                  </Typography>
                  <Input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => handleFileUpload(e, 'project')}
                      fullWidth
                  />
              </Box>
              <Box component={Paper} elevation={3} p={2} textAlign="center">
                  <Typography variant="h6" fontWeight="medium">
                      Inventory File
                  </Typography>
                  <Input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => handleFileUpload(e, 'inventory')}
                      fullWidth
                  />
              </Box>
          </Box>
  
          {projectData.length > 0 && (
              <Box mt={6}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Project Data
                  </Typography>
                  <TableContainer component={Paper}>
                      <Table>
                          <TableHead>
                              <TableRow>
                                  {projectData[0].map((header, idx) => (
                                      <TableCell key={idx} sx={{ fontWeight: 'medium', bgcolor: 'grey.200' }}>
                                          {header}
                                      </TableCell>
                                  ))}
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {projectData.slice(1).map((row, idx) => (
                                  <TableRow key={idx} hover>
                                      {row.map((cell, cellIdx) => (
                                          <TableCell key={cellIdx}>
                                              {cell}
                                          </TableCell>
                                      ))}
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </TableContainer>
              </Box>
          )}
  
          {inventoryData.length > 0 && (
              <Box mt={6}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Inventory Data
                  </Typography>
                  <TableContainer component={Paper}>
                      <Table>
                          <TableHead>
                              <TableRow>
                                  {inventoryData[0].map((header, idx) => (
                                      <TableCell key={idx} sx={{ fontWeight: 'medium', bgcolor: 'grey.200' }}>
                                          {header}
                                      </TableCell>
                                  ))}
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {inventoryData.slice(1).map((row, idx) => (
                                  <TableRow key={idx} hover>
                                      {row.map((cell, cellIdx) => (
                                          <TableCell key={cellIdx}>
                                              {cell}
                                          </TableCell>
                                      ))}
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </TableContainer>
              </Box>
          )}
  
          <Box mt={4}>
              <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ py: 1.5, mb: 2 }}
                  onClick={generateReport}
              >
                  Generate Report
              </Button>
              {report && (
    <Box sx={{ mt: 6, p: 4, bgcolor: "white", boxShadow: 1, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
            Generated Report
        </Typography>
        <Box
            sx={{
                whiteSpace: "pre-wrap",
                color: "grey.700",
                bgcolor: "grey.100",
                p: 3,
                borderRadius: 2,
                overflow: "auto",
                fontFamily: "Arial, sans-serif", // กำหนดฟอนต์
                fontSize: "1.5rem", // ขนาดฟอนต์
            }}
        >
            {report.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
            ))}
        </Box>
        <Button
            onClick={exportToWord}
            variant="contained"
            color="success"
            sx={{ mt: 3 }}
        >
            Export Report to Word
        </Button>
    </Box>
)}
          </Box>
      </Container>
  );

};

export default Generatereport;
