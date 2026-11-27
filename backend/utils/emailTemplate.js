// For student
exports.welcomeEmailTemplate = ({
    recipientName,
    username,
    email,
    password,
    role,
    date
}) => {

    return `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background: #F9FAFB;
        color: #374151;
        margin: 0;
        padding: 30px;
    }

    .header {
        background: linear-gradient(135deg, #DC2626, #B91C1C);
        color: white;
        padding: 30px 20px;
        text-align: center;
        border-radius: 12px 12px 0 0;
    }

    .header h1 {
      margin: 8px 0 0;
      font-size: 24px;
      font-weight: 600;
    }

    .header h2 {
      margin: 0;
      font-size: 18px;
      opacity: 0.9;
    }

    .content {
        background: #ffffff;
        border-radius: 0 0 12px 12px;
        padding: 30px;
        border: 1px solid #E5E7EB;
    }

    .card {
        background: #FEF2F2;
        border-left: 5px solid #DC2626;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .details-table td {
      padding: 12px 8px;
      border-bottom: 1px solid #eee;
      vertical-align: top;
    }

    .details-table td:first-child {
        color: #991B1B;
        font-weight: bold;
    }

    .details-table tr:last-child td {
      border-bottom: none;
    }

    .role-badge {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: bold;
        background: #FEE2E2;
        color: #B91C1C;
    }

    .password-warning {
      color: #B91C1C;
      font-weight: 600;
      background-color: #FEE2E2;
      padding: 12px;
      border-radius: 6px;
      margin-top: 12px;
      border-left: 4px solid #DC2626;
    }

    .footer {
      margin-top: 28px;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Nihongo Learning Management System</h2>
    <h1>Welcome to LMS!</h1>
  </div>
  
  <div class="content">
    <p>Dear <strong>${recipientName}</strong>,</p>
    
    <div class="card">
    <p>
    Welcome to the <strong>Japanese Learning Management System</strong>!

    Your account has been successfully created. You can now log in and begin your Japanese learning journey.
    </p>      
      <table class="details-table">
        <tr>
          <td>Full Name:</td>
          <td>${recipientName}</td>
        </tr>
        <tr>
          <td>Username:</td>
          <td>${username}</td>
        </tr>
        <tr>
          <td>Email:</td>
          <td>${email}</td>
        </tr>
        
        <tr>
          <td>Password:</td>
          <td>${password}</td>
        </tr>


        
        <tr>
          <td>Role:</td>
          <td><span class="role-badge">${role}</span></td>
        </tr>
        
      </table>
      
      <p>
        For security reasons, please keep your password confidential.
        If you ever forget it, you can use the <strong>Forgot Password</strong> option on the login page.
        </p>
    </div>
    
    
    
    <div class="footer">
        <p><strong>Nihongo Learning Management System</strong></p>

        <p>
            Learn Japanese. Build Your Future.
        </p>

        <p>
            This is an automated email. Please do not reply.
        </p>

        <p>
            © 2026 Nihongo LMS. All Rights Reserved.
        </p>
    </div>
  </div>
</body>
</html>

  `;

};

// For instructor
exports.welcomeEmailTemplateInstructor = ({
    recipientName,
    username,
    email,
    password,
    role,
    date
}) => {

    return `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background: #F9FAFB;
        color: #374151;
        margin: 0;
        padding: 30px;
    }

    .header {
        background: linear-gradient(135deg, #DC2626, #B91C1C);
        color: white;
        padding: 30px 20px;
        text-align: center;
        border-radius: 12px 12px 0 0;
    }

    .header h1 {
      margin: 8px 0 0;
      font-size: 24px;
      font-weight: 600;
    }

    .header h2 {
      margin: 0;
      font-size: 18px;
      opacity: 0.9;
    }

    .content {
        background: #ffffff;
        border-radius: 0 0 12px 12px;
        padding: 30px;
        border: 1px solid #E5E7EB;
    }

    .card {
        background: #FEF2F2;
        border-left: 5px solid #DC2626;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .details-table td {
      padding: 12px 8px;
      border-bottom: 1px solid #eee;
      vertical-align: top;
    }

    .details-table td:first-child {
        color: #991B1B;
        font-weight: bold;
    }

    .details-table tr:last-child td {
      border-bottom: none;
    }

    .role-badge {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: bold;
        background: #FEE2E2;
        color: #B91C1C;
    }

    .password-warning {
      color: #B91C1C;
      font-weight: 600;
      background-color: #FEE2E2;
      padding: 12px;
      border-radius: 6px;
      margin-top: 12px;
      border-left: 4px solid #DC2626;
    }

    .footer {
      margin-top: 28px;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Nihongo Learning Management System</h2>
    <h1>Welcome to LMS!</h1>
  </div>
  
  <div class="content">
    <p>Dear <strong>${recipientName}</strong>,</p>
    
    <div class="card">
    <p>
    Welcome to the <strong>Japanese Learning Management System</strong>!

    Your account has been successfully created. You can now log in and access your instructor dashboard to begin managing your assigned trainings.
    </p>      
      <table class="details-table">
        <tr>
          <td>Full Name:</td>
          <td>${recipientName}</td>
        </tr>
        <tr>
          <td>Username:</td>
          <td>${username}</td>
        </tr>
        <tr>
          <td>Email:</td>
          <td>${email}</td>
        </tr>
        
        <tr>
          <td>Password:</td>
          <td>${password}</td>
        </tr>


        
        <tr>
          <td>Role:</td>
          <td><span class="role-badge">${role}</span></td>
        </tr>
        
      </table>
      
      <p>
        For security reasons, please keep your password confidential.
        If you ever forget it, you can use the <strong>Forgot Password</strong> option on the login page.
        </p>
    </div>
    
    
    
    <div class="footer">
        <p><strong>Nihongo Learning Management System</strong></p>

        <p>
            Learn Japanese. Build Your Future.
        </p>

        <p>
            This is an automated email. Please do not reply.
        </p>

        <p>
            © 2026 Nihongo LMS. All Rights Reserved.
        </p>
    </div>
  </div>
</body>
</html>

  `;

};

exports.resetPasswordEmailTemplate = ({
    recipientName,
    resetLink
}) => {

    return `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background: #F9FAFB;
        color: #374151;
        margin: 0;
        padding: 30px;
    }

    .header {
        background: linear-gradient(135deg, #DC2626, #B91C1C);
        color: white;
        padding: 30px 20px;
        text-align: center;
        border-radius: 12px 12px 0 0;
    }

    .header h1 {
      margin: 8px 0 0;
      font-size: 24px;
      font-weight: 600;
    }

    .content {
        background: #ffffff;
        border-radius: 0 0 12px 12px;
        padding: 30px;
        border: 1px solid #E5E7EB;
    }

    .card {
        background: #FEF2F2;
        border-left: 5px solid #DC2626;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
    }

    .btn {
        display: inline-block;
        margin-top: 16px;
        padding: 12px 28px;
        background: linear-gradient(135deg, #DC2626, #EA580C);
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
    }

    .warning {
      color: #B91C1C;
      font-weight: 600;
      background-color: #FEE2E2;
      padding: 12px;
      border-radius: 6px;
      margin-top: 16px;
      border-left: 4px solid #DC2626;
      font-size: 13px;
    }

    .footer {
      margin-top: 28px;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Nihongo Learning Management System</h2>
    <h1>Reset Your Password</h1>
  </div>

  <div class="content">
    <p>Dear <strong>${recipientName}</strong>,</p>

    <div class="card">
      <p>
        We received a request to reset your password. Click the button below to choose a new password.
      </p>

      <a href="${resetLink}" class="btn">Reset Password</a>

      <div class="warning">
        This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
      </div>
    </div>

    <div class="footer">
        <p><strong>Nihongo Learning Management System</strong></p>
        <p>This is an automated email. Please do not reply.</p>
        <p>© 2026 Nihongo LMS. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

exports.liveSessionCreatedEmailTemplate = ({
  recipientName,
  trainingTitle,
  lessonTitle,
  meetingPlatform,
  meetingLink,
  meetingPassword,
  startTime,
  endTime
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background: #F9FAFB;
        color: #374151;
        margin: 0;
        padding: 30px;
      }

      .header {
        background: linear-gradient(135deg, #2563EB, #1D4ED8);
        color: white;
        padding: 30px 20px;
        text-align: center;
        border-radius: 12px 12px 0 0;
      }

      .content {
        background: #ffffff;
        border-radius: 0 0 12px 12px;
        padding: 30px;
        border: 1px solid #E5E7EB;
      }

      .card {
        background: #EFF6FF;
        border-left: 5px solid #2563EB;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .btn {
        display: inline-block;
        margin-top: 16px;
        padding: 12px 28px;
        background: #2563EB;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
      }

      .footer {
        margin-top: 28px;
        font-size: 12px;
        color: #6b7280;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        padding-top: 12px;
      }
    </style>
  </head>

  <body>

    <div class="header">
      <h2>Nihongo Learning Management System</h2>
      <h1>Live Lecture Scheduled</h1>
    </div>

    <div class="content">

      <p>Dear <strong>${recipientName}</strong>,</p>

      <p>
        A live lecture has been scheduled for your course.
      </p>

      <div class="card">

        <p><strong>Course:</strong> ${trainingTitle}</p>

        <p><strong>Lesson:</strong> ${lessonTitle}</p>

        <p><strong>Platform:</strong> ${meetingPlatform}</p>

        <p><strong>Start Time:</strong> ${startTime}</p>

        ${
          endTime
            ? `<p><strong>End Time:</strong> ${endTime}</p>`
            : ""
        }

        ${
          meetingPassword
            ? `<p><strong>Meeting Password:</strong> ${meetingPassword}</p>`
            : ""
        }

        <a href="${meetingLink}" class="btn">
          Join Live Lecture
        </a>

      </div>

      <p>
        Please join the session at the scheduled time.
      </p>

      <div class="footer">
        <p><strong>Nihongo Learning Management System</strong></p>
        <p>This is an automated email. Please do not reply.</p>
        <p>© 2026 Nihongo LMS. All Rights Reserved.</p>
      </div>

    </div>

  </body>
  </html>
  `;
};


exports.liveSessionUpdatedEmailTemplate = ({
  recipientName,
  trainingTitle,
  lessonTitle,
  meetingPlatform,
  meetingLink,
  meetingPassword,
  startTime,
  endTime
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background: #F9FAFB;
        color: #374151;
        margin: 0;
        padding: 30px;
      }

      .header {
        background: linear-gradient(135deg, #D97706, #B45309);
        color: white;
        padding: 30px 20px;
        text-align: center;
        border-radius: 12px 12px 0 0;
      }

      .content {
        background: #ffffff;
        border-radius: 0 0 12px 12px;
        padding: 30px;
        border: 1px solid #E5E7EB;
      }

      .card {
        background: #FFFBEB;
        border-left: 5px solid #D97706;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .btn {
        display: inline-block;
        margin-top: 16px;
        padding: 12px 28px;
        background: #D97706;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
      }

      .footer {
        margin-top: 28px;
        font-size: 12px;
        color: #6b7280;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        padding-top: 12px;
      }
    </style>
  </head>

  <body>

    <div class="header">
      <h2>Nihongo Learning Management System</h2>
      <h1>Live Lecture Updated</h1>
    </div>

    <div class="content">

      <p>Dear <strong>${recipientName}</strong>,</p>

      <p>
        The details of an upcoming live lecture have been updated.
      </p>

      <div class="card">

        <p><strong>Course:</strong> ${trainingTitle}</p>
        <p><strong>Lesson:</strong> ${lessonTitle}</p>

        <p><strong>Platform:</strong> ${meetingPlatform}</p>

        <p><strong>Start Time:</strong> ${startTime}</p>

        ${
          endTime
            ? `<p><strong>End Time:</strong> ${endTime}</p>`
            : ""
        }

        ${
          meetingPassword
            ? `<p><strong>Meeting Password:</strong> ${meetingPassword}</p>`
            : ""
        }

        <a href="${meetingLink}" class="btn">
          Join Updated Live Lecture
        </a>

      </div>

      <p>
        Please note the updated schedule and meeting details.
      </p>

      <div class="footer">
        <p><strong>Nihongo Learning Management System</strong></p>
        <p>This is an automated email. Please do not reply.</p>
        <p>© 2026 Nihongo LMS. All Rights Reserved.</p>
      </div>

    </div>

  </body>
  </html>
  `;
};


exports.liveSessionDeletedEmailTemplate = ({
  recipientName,
  trainingTitle,
  lessonTitle
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background: #F9FAFB;
        color: #374151;
        margin: 0;
        padding: 30px;
      }

      .header {
        background: linear-gradient(135deg, #DC2626, #B91C1C);
        color: white;
        padding: 30px 20px;
        text-align: center;
        border-radius: 12px 12px 0 0;
      }

      .content {
        background: #ffffff;
        border-radius: 0 0 12px 12px;
        padding: 30px;
        border: 1px solid #E5E7EB;
      }

      .card {
        background: #FEF2F2;
        border-left: 5px solid #DC2626;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .footer {
        margin-top: 28px;
        font-size: 12px;
        color: #6b7280;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        padding-top: 12px;
      }
    </style>
  </head>

  <body>

    <div class="header">
      <h2>Nihongo Learning Management System</h2>
      <h1>Live Lecture Cancelled</h1>
    </div>

    <div class="content">

      <p>Dear <strong>${recipientName}</strong>,</p>

      <div class="card">

        <p>
          The following live lecture has been cancelled:
        </p>

        <p>
          <strong>Course:</strong> ${trainingTitle}
        </p>

        <p>
          <strong>Lesson:</strong> ${lessonTitle}
        </p>

      </div>

      <p>
        Please check the LMS for any further updates.
      </p>

      <div class="footer">
        <p><strong>Nihongo Learning Management System</strong></p>
        <p>This is an automated email. Please do not reply.</p>
        <p>© 2026 Nihongo LMS. All Rights Reserved.</p>
      </div>

    </div>

  </body>
  </html>
  `;
};

/* ENROLLMENT APPROVED EMAIL */

exports.enrollmentApprovedEmailTemplate = ({
  recipientName,
  trainingTitle
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background: #F9FAFB;
        color: #374151;
        margin: 0;
        padding: 30px;
      }

      .header {
        background: linear-gradient(135deg, #16A34A, #15803D);
        color: white;
        padding: 30px 20px;
        text-align: center;
        border-radius: 12px 12px 0 0;
      }

      .header h1 {
        margin: 8px 0 0;
        font-size: 24px;
        font-weight: 600;
      }

      .header h2 {
        margin: 0;
        font-size: 18px;
        opacity: 0.9;
      }

      .content {
        background: #ffffff;
        border-radius: 0 0 12px 12px;
        padding: 30px;
        border: 1px solid #E5E7EB;
      }

      .card {
        background: #F0FDF4;
        border-left: 5px solid #16A34A;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .details-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
      }

      .details-table td {
        padding: 12px 8px;
        border-bottom: 1px solid #eee;
        vertical-align: top;
      }

      .details-table td:first-child {
        color: #166534;
        font-weight: bold;
      }

      .details-table tr:last-child td {
        border-bottom: none;
      }

      .status-badge {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: bold;
        background: #DCFCE7;
        color: #15803D;
      }

      .footer {
        margin-top: 28px;
        font-size: 12px;
        color: #6b7280;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        padding-top: 12px;
      }
    </style>
  </head>

  <body>

    <div class="header">
      <h2>Nihongo Learning Management System</h2>
      <h1>Enrollment Approved</h1>
    </div>

    <div class="content">

      <p>Dear <strong>${recipientName}</strong>,</p>

      <div class="card">

        <p>
          Your enrollment request has been successfully approved.
        </p>

        <table class="details-table">

          <tr>
            <td>Training:</td>
            <td>${trainingTitle}</td>
          </tr>

          <tr>
            <td>Status:</td>
            <td>
              <span class="status-badge">Approved</span>
            </td>
          </tr>

        </table>

        <p>
          You can now access the training from your LMS account.
        </p>

      </div>

      <p>
        Please log in to the LMS to view your training details and continue your learning journey.
      </p>

      <div class="footer">
        <p><strong>Nihongo Learning Management System</strong></p>
        <p>Learn Japanese. Build Your Future.</p>
        <p>This is an automated email. Please do not reply.</p>
        <p>© 2026 Nihongo LMS. All Rights Reserved.</p>
      </div>

    </div>

  </body>
  </html>
  `;
};


/* ENROLLMENT REJECTED EMAIL */

exports.enrollmentRejectedEmailTemplate = ({
  recipientName,
  trainingTitle
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background: #F9FAFB;
        color: #374151;
        margin: 0;
        padding: 30px;
      }

      .header {
        background: linear-gradient(135deg, #DC2626, #B91C1C);
        color: white;
        padding: 30px 20px;
        text-align: center;
        border-radius: 12px 12px 0 0;
      }

      .header h1 {
        margin: 8px 0 0;
        font-size: 24px;
        font-weight: 600;
      }

      .header h2 {
        margin: 0;
        font-size: 18px;
        opacity: 0.9;
      }

      .content {
        background: #ffffff;
        border-radius: 0 0 12px 12px;
        padding: 30px;
        border: 1px solid #E5E7EB;
      }

      .card {
        background: #FEF2F2;
        border-left: 5px solid #DC2626;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .details-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
      }

      .details-table td {
        padding: 12px 8px;
        border-bottom: 1px solid #eee;
        vertical-align: top;
      }

      .details-table td:first-child {
        color: #991B1B;
        font-weight: bold;
      }

      .details-table tr:last-child td {
        border-bottom: none;
      }

      .status-badge {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: bold;
        background: #FEE2E2;
        color: #B91C1C;
      }

      .footer {
        margin-top: 28px;
        font-size: 12px;
        color: #6b7280;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        padding-top: 12px;
      }
    </style>
  </head>

  <body>

    <div class="header">
      <h2>Nihongo Learning Management System</h2>
      <h1>Enrollment Rejected</h1>
    </div>

    <div class="content">

      <p>Dear <strong>${recipientName}</strong>,</p>

      <div class="card">

        <p>
          Your enrollment request has been rejected.
        </p>

        <table class="details-table">

          <tr>
            <td>Training:</td>
            <td>${trainingTitle}</td>
          </tr>

          <tr>
            <td>Status:</td>
            <td>
              <span class="status-badge">Rejected</span>
            </td>
          </tr>

        </table>

        <p>
          If you have any questions regarding this enrollment decision, please contact the LMS administrator.
        </p>

      </div>

      <p>
        Please check your LMS account for any further updates.
      </p>

      <div class="footer">
        <p><strong>Nihongo Learning Management System</strong></p>
        <p>Learn Japanese. Build Your Future.</p>
        <p>This is an automated email. Please do not reply.</p>
        <p>© 2026 Nihongo LMS. All Rights Reserved.</p>
      </div>

    </div>

  </body>
  </html>
  `;
};


exports.companyAdminWelcomeEmail = ({
    recipientName,
    companyName,
    username,
    email,
    password,
    date
}) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: "Segoe UI", Tahoma, sans-serif;
                background: #F9FAFB;
                color: #374151;
                padding: 30px;
            }

            .header {
                background: linear-gradient(135deg, #DC2626, #B91C1C);
                color: white;
                padding: 25px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }

            .content {
                background: white;
                padding: 30px;
                border: 1px solid #E5E7EB;
                border-radius: 0 0 12px 12px;
            }

            .card {
                background: #FEF2F2;
                border-left: 5px solid #DC2626;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }

            td {
                padding: 12px 8px;
                border-bottom: 1px solid #E5E7EB;
            }

            td:first-child {
                color: #991B1B;
                font-weight: bold;
            }

            .warning {
                color: #B91C1C;
                background: #FEE2E2;
                padding: 12px;
                border-radius: 6px;
                font-weight: 600;
            }

            .footer {
                margin-top: 25px;
                text-align: center;
                font-size: 12px;
                color: #6B7280;
            }
        </style>
    </head>

    <body>
        <div class="header">
            <h2>TrainSphere Learning Management System</h2>
            <h1>Company Admin Account Created</h1>
        </div>

        <div class="content">
            <p>Dear <strong>${recipientName}</strong>,</p>

            <p>
                Welcome to TrainSphere!
                Your Company Admin account has been successfully created
                for <strong>${companyName}</strong>.
            </p>

            <div class="card">
                <h3>Your Login Details</h3>

                <table>
                    <tr>
                        <td>Company</td>
                        <td>${companyName}</td>
                    </tr>

                    <tr>
                        <td>Full Name</td>
                        <td>${recipientName}</td>
                    </tr>

                    <tr>
                        <td>Username</td>
                        <td>${username}</td>
                    </tr>

                    <tr>
                        <td>Email</td>
                        <td>${email}</td>
                    </tr>

                    <tr>
                        <td>Password</td>
                        <td>${password}</td>
                    </tr>

                    <tr>
                        <td>Role</td>
                        <td>Company Admin</td>
                    </tr>
                </table>

                <p class="warning">
                    Please keep your password confidential and change it
                    after your first login.
                </p>
            </div>

            <p>
                You can now log in to TrainSphere and manage your
                company's users and assigned courses.
            </p>

            <p>Account created on: ${date}</p>

            <div class="footer">
                <p><strong>TrainSphere Learning Management System</strong></p>
                <p>Learn Contruction-related disciplines. Build Safe Future.</p>
                <p>This is an automated email. Please do not reply.</p>
                <p>© 2026 TrainSphere. All Rights Reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};


// ---------------------------------------
// COMPANY NOTIFICATION EMAIL
// ---------------------------------------

exports.companyAdminCreatedNotificationEmail = ({
    companyName,
    companyEmail,
    adminName,
    adminEmail,
    adminUsername,
    date
}) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: "Segoe UI", Tahoma, sans-serif;
                background: #F9FAFB;
                color: #374151;
                padding: 30px;
            }

            .header {
                background: linear-gradient(135deg, #DC2626, #B91C1C);
                color: white;
                padding: 25px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }

            .content {
                background: white;
                padding: 30px;
                border: 1px solid #E5E7EB;
                border-radius: 0 0 12px 12px;
            }

            .card {
                background: #FEF2F2;
                border-left: 5px solid #DC2626;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }

            td {
                padding: 12px 8px;
                border-bottom: 1px solid #E5E7EB;
            }

            td:first-child {
                color: #991B1B;
                font-weight: bold;
            }

            .footer {
                margin-top: 25px;
                text-align: center;
                font-size: 12px;
                color: #6B7280;
            }
        </style>
    </head>

    <body>
        <div class="header">
            <h2>TrainSphere Learning Management System</h2>
            <h1>Company Admin Created</h1>
        </div>

        <div class="content">
            <p>Dear <strong>${companyName}</strong>,</p>

            <p>
                We are pleased to inform you that your Company Admin
                account has been successfully created in TrainSphere.
            </p>

            <div class="card">
                <h3>Company Admin Information</h3>

                <table>
                    <tr>
                        <td>Company</td>
                        <td>${companyName}</td>
                    </tr>

                    <tr>
                        <td>Company Email</td>
                        <td>${companyEmail || "Not provided"}</td>
                    </tr>

                    <tr>
                        <td>Admin Name</td>
                        <td>${adminName}</td>
                    </tr>

                    <tr>
                        <td>Admin Email</td>
                        <td>${adminEmail}</td>
                    </tr>

                    <tr>
                        <td>Username</td>
                        <td>${adminUsername}</td>
                    </tr>

                    <tr>
                        <td>Role</td>
                        <td>Company Admin</td>
                    </tr>
                </table>
            </div>

            <p>
                The Company Admin can now log in and manage the company's
                users and assigned courses.
            </p>

            <p>Account created on: ${date}</p>

            <div class="footer">
                <p><strong>TrainSphere Learning Management System</strong></p>
                <p>Learn Contruction-related disciplines. Build Safe Future.</p>
                <p>This is an automated email. Please do not reply.</p>
                <p>© 2026 TrainSphere. All Rights Reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};


exports.companyTrainingsAssignedEmail = ({
    recipientName,
    companyName,
    trainings,
    isCompanyAdmin
}) => {

    const trainingRows = trainings.map(training => `
        <tr>
            <td>${training.training_title}</td>
            <td>${training.training_users_limit}</td>
            <td>${training.training_expiry_on}</td>
        </tr>
    `).join("");

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: "Segoe UI", Tahoma, sans-serif;
                background: #F9FAFB;
                color: #374151;
                padding: 30px;
            }

            .header {
                background: linear-gradient(135deg, #DC2626, #B91C1C);
                color: white;
                padding: 25px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }

            .content {
                background: white;
                padding: 30px;
                border: 1px solid #E5E7EB;
            }

            .card {
                background: #FEF2F2;
                border-left: 5px solid #DC2626;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }

            th, td {
                padding: 12px 8px;
                border-bottom: 1px solid #E5E7EB;
                text-align: left;
            }

            th {
                color: #991B1B;
                background: #FEF2F2;
            }

            .footer {
                margin-top: 25px;
                text-align: center;
                font-size: 12px;
                color: #6B7280;
            }
        </style>
    </head>

    <body>
        <div class="header">
            <h2>TrainSphere Learning Management System</h2>
            <h1>New Courses Assigned</h1>
        </div>

        <div class="content">
            <p>Dear <strong>${recipientName}</strong>,</p>

            <p>
                ${isCompanyAdmin
                    ? `New courses have been assigned to your company, ${companyName}. You can now manage employee enrollment for these courses.`
                    : `We are pleased to inform you that new courses have been assigned to ${companyName} in TrainSphere.`
                }
            </p>

            <div class="card">
                <h3>Assigned Courses</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>User Limit</th>
                            <th>Expiry Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${trainingRows}
                    </tbody>
                </table>
            </div>

            ${isCompanyAdmin
                ? `<p>Please log in to TrainSphere to view your assigned courses and manage employee enrollment.</p>`
                : `<p>Your Company Admin has been notified and can manage employee enrollment for the assigned courses.</p>`
            }

            <div class="footer">
                <p><strong>TrainSphere Learning Management System</strong></p>
                <p>Learn Construction-related disciplines. Build Safe Future.</p>
                <p>This is an automated email. Please do not reply.</p>
                <p>© 2026 TrainSphere. All Rights Reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};


exports.employeeWelcomeEmail = ({
    recipientName,
    companyName,
    username,
    email,
    password,
    loginUrl,
    date
}) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: "Segoe UI", Tahoma, sans-serif;
                background: #F9FAFB;
                color: #374151;
                padding: 30px;
            }

            .header {
                background: linear-gradient(135deg, #DC2626, #B91C1C);
                color: white;
                padding: 25px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }

            .content {
                background: white;
                padding: 30px;
                border: 1px solid #E5E7EB;
                border-radius: 0 0 12px 12px;
            }

            .card {
                background: #FEF2F2;
                border-left: 5px solid #DC2626;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }

            td {
                padding: 12px 8px;
                border-bottom: 1px solid #E5E7EB;
            }

            td:first-child {
                color: #991B1B;
                font-weight: bold;
            }

            .warning {
                color: #B91C1C;
                background: #FEE2E2;
                padding: 12px;
                border-radius: 6px;
                font-weight: 600;
            }

            .login-button {
                display: inline-block;
                background: #DC2626;
                color: white !important;
                text-decoration: none;
                padding: 13px 28px;
                border-radius: 6px;
                font-weight: 600;
                margin: 15px 0;
            }

            .footer {
                margin-top: 25px;
                text-align: center;
                font-size: 12px;
                color: #6B7280;
            }
        </style>
    </head>

    <body>
        <div class="header">
            <h2>TrainSphere Learning Management System</h2>
            <h1>Employee Account Created</h1>
        </div>

        <div class="content">
            <p>Dear <strong>${recipientName}</strong>,</p>

            <p>
                Welcome to TrainSphere!

                Your Trainee/Employee account has been successfully
                created by your company administrator for
                <strong>${companyName}</strong>.
            </p>

            <div class="card">
                <h3>Your Login Details</h3>

                <table>
                    <tr>
                        <td>Company</td>
                        <td>${companyName}</td>
                    </tr>

                    <tr>
                        <td>Full Name</td>
                        <td>${recipientName}</td>
                    </tr>

                    <tr>
                        <td>Username</td>
                        <td>${username}</td>
                    </tr>

                    <tr>
                        <td>Email</td>
                        <td>${email}</td>
                    </tr>

                    <tr>
                        <td>Password</td>
                        <td>${password}</td>
                    </tr>

                    <tr>
                        <td>Role</td>
                        <td>Trainee / Employee</td>
                    </tr>
                </table>

                <p class="warning">
                    Please keep your password confidential and change it
                    after your first login.
                </p>
            </div>

            <p>
                You can now access TrainSphere using the login link below
                to view and participate in the training courses assigned
                to your company.
            </p>

            <div style="text-align: center;">
                <a href="${loginUrl}" class="login-button">
                    Login to TrainSphere
                </a>
            </div>

            <p>
                If the button doesn't work, copy and paste the following
                URL into your browser:
            </p>

            <p>
                <a href="${loginUrl}">${loginUrl}</a>
            </p>

            <p>Account created on: ${date}</p>

            <div class="footer">
                <p><strong>TrainSphere Learning Management System</strong></p>
                <p>Learn Construction-related disciplines. Build Safe Future.</p>
                <p>This is an automated email. Please do not reply.</p>
                <p>© 2026 TrainSphere. All Rights Reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};


exports.employeeCourseEnrollmentEmail = ({
    recipientName,
    companyName,
    courses,
    date,
    loginUrl
}) => {

    const courseRows = courses.map((course, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${course.training_title}</td>
        </tr>
    `).join("");

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">

        <style>
            body {
                font-family: "Segoe UI", Tahoma, sans-serif;
                background: #F9FAFB;
                color: #374151;
                padding: 30px;
            }

            .header {
                background: linear-gradient(135deg, #DC2626, #B91C1C);
                color: white;
                padding: 25px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }

            .content {
                background: white;
                padding: 30px;
                border: 1px solid #E5E7EB;
                border-radius: 0 0 12px 12px;
            }

            .card {
                background: #FEF2F2;
                border-left: 5px solid #DC2626;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }

            th, td {
                padding: 12px;
                border-bottom: 1px solid #E5E7EB;
                text-align: left;
            }

            th {
                color: #991B1B;
            }

            .login-button {
                display: inline-block;
                background: #DC2626;
                color: white !important;
                text-decoration: none;
                padding: 13px 28px;
                border-radius: 6px;
                font-weight: 600;
                margin: 15px 0;
            }

            .footer {
                margin-top: 25px;
                text-align: center;
                font-size: 12px;
                color: #6B7280;
            }
        </style>
    </head>

    <body>

        <div class="header">
            <h2>TrainSphere Learning Management System</h2>
            <h1>Course Enrollment Successful</h1>
        </div>

        <div class="content">

            <p>Dear <strong>${recipientName}</strong>,</p>

            <p>
                Great news! Your company administrator has successfully
                enrolled you in the following course(s) on TrainSphere.
            </p>

            <div class="card">

                <h3>Enrollment Details</h3>

                <p>
                    <strong>Company:</strong> ${companyName}
                </p>

                <p>
                    <strong>Enrollment Date:</strong> ${date}
                </p>

                <h3>Enrolled Courses</h3>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Course Name</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${courseRows}
                    </tbody>
                </table>

            </div>

            <p>
                You can now log in to TrainSphere and access your
                enrolled courses from the My Learning section.
            </p>

            <div style="text-align: center;">
                <a href="${loginUrl}" class="login-button">
                    Login to TrainSphere
                </a>
            </div>

            <p>
                If the button doesn't work, copy and paste this URL
                into your browser:
            </p>

            <p>
                <a href="${loginUrl}">${loginUrl}</a>
            </p>

            <div class="footer">
                <p><strong>TrainSphere Learning Management System</strong></p>
                <p>Learn Construction-related disciplines. Build Safe Future.</p>
                <p>This is an automated email. Please do not reply.</p>
                <p>© 2026 TrainSphere. All Rights Reserved.</p>
            </div>

        </div>

    </body>
    </html>
    `;
};
