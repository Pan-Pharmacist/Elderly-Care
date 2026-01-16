Private Sub btnCalculate_Click()
    On Error GoTo ErrorHandler

    ' ตรวจสอบข้อมูลครบ
    If IsNull(Me.cmbPatient) Or IsNull(Me.cmbDrug) Or _
       IsNull(Me.txtDailyDose) Or IsNull(Me.txtStartDate) Or IsNull(Me.txtNextVisit) Then
        MsgBox "กรุณากรอกข้อมูลให้ครบทุกช่อง", vbExclamation, "แจ้งเตือน"
        Exit Sub
    End If

    ' บันทึกข้อมูลถ้าเป็น New Record
    If Me.NewRecord Then
        DoCmd.RunCommand acCmdSaveRecord
    End If
    If Me.Dirty Then Me.Dirty = False

    ' ตรวจว่ามี PrescriptionID จริง
    If IsNull(Me.txtPrescriptionID) Or Me.txtPrescriptionID = 0 Then
        MsgBox "ไม่สามารถบันทึก Prescription ได้ กรุณาลองใหม่", vbCritical
        Exit Sub
    End If

    ' ปิดแจ้งเตือน
    DoCmd.SetWarnings False

    ' เพิ่มข้อมูลรอบจ่ายยาใหม่ (ไม่ซ้ำ)
    DoCmd.RunSQL _
    "INSERT INTO PreparationSchedule (PrescriptionID, PickupDate, BottlesThisRound) " & _
    "SELECT P.PrescriptionID, " & _
    "DateAdd('d', Nz(M.ExpiryDays,7)*Nz(N.N,0), P.StartDate), " & _
    "IIf(DateAdd('d', Nz(M.ExpiryDays,7)*Nz(N.N,0), P.StartDate) < P.NextVisit, " & _
    "Round((P.DailyDose * Nz(M.ExpiryDays,7)) / M.BottleSize,2), " & _
    "Round((P.DailyDose * (P.NextVisit - DateAdd('d', Nz(M.ExpiryDays,7)*(Nz(N.N,0)-1), P.StartDate))) / M.BottleSize,2)) " & _
    "FROM ((Prescriptions AS P " & _
    "INNER JOIN Patients AS Pa ON P.PatientID = Pa.PatientID) " & _
    "INNER JOIN Medications AS M ON P.DrugID = M.DrugID), qry_Numbers AS N " & _
    "WHERE P.PrescriptionID = " & Me.txtPrescriptionID & " " & _
    "AND DateAdd('d', Nz(M.ExpiryDays,7)*Nz(N.N,0), P.StartDate) <= P.NextVisit " & _
    "AND NOT EXISTS (SELECT 1 FROM PreparationSchedule AS PS " & _
    "WHERE PS.PrescriptionID = P.PrescriptionID AND PS.PickupDate = DateAdd('d', Nz(M.ExpiryDays,7)*Nz(N.N,0), P.StartDate))"

    DoCmd.SetWarnings True

    ' แจ้งผล
    MsgBox ChrW(10004) & " บันทึกและคำนวณรอบยาเรียบร้อย!", vbInformation, "สำเร็จ"

    ' ? เปิดเฉพาะ Report ของ Prescription ปัจจุบัน
    DoCmd.OpenReport "rpt_PickupSchedule", acViewPreview, , "PrescriptionID = " & Me.txtPrescriptionID

    ' ? ***ไม่ต้อง GoToRecord ที่นี่*** เพื่อป้องกัน ERROR
    ' ให้ผู้ใช้กดปุ่ม "เพิ่มใบสั่งยาใหม่" (btnNewPrescription) เมื่อจะกรอกคนใหม่
    Exit Sub

ErrorHandler:
    DoCmd.SetWarnings True
    MsgBox "? เกิดข้อผิดพลาด: " & Err.Description, vbCritical
End Sub