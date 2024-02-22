const welcomeMailBody = (from_who, email) => {
  return {
    from: `UnieLogics <${from_who}>`,
    to: email,
    subject: "Welcome to UnieLogics",
    text: "Welcome to UnieLogics",
    html: `<table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
      style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
      <tr>
        <td>
            <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
              align="center" cellpadding="0" cellspacing="0">
              <tr>
                  <td style="height:80px;">&nbsp;</td>
              </tr>
              <tr>
                  <td style="height:20px;">&nbsp;</td>
              </tr>
              <tr>
                  <td>
                    <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                        style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                        <tr>
                          <td style="height:40px;">&nbsp;</td>
                        </tr>
                        <tr>
                          <td><img src="https://www.unielogics.com/images/logo.png" alt="Logo" title="Logo" style="display:block;margin:0 auto;margin-bottom:15px;" width="120"/></td>
                        </tr>
                        <tr>
                          <td style="padding:0 35px;">
                              <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Welcome to UnieLogics
                              </h1>
                              <span
                                style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                <b>Hurray! You are now part of an awesome community!</b><br /><br /> Your username is: <span style="color:red;"><b>${email}</b></span><br />
                                <b>To login,</b> please click the below button and use the password you've set when you created your account.
                              </p>
                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;"><b>Forgot password?</b> Don't worry, you can reset it by accessing this page:  <a href="https://www.unielogics.com/login" target="_blank">Forgot password!</a> and click on "Forgot password"</p>
                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;"><b>Don't have the extension installed?</b> Just go to our website:  <a href="https://www.unielogics.com/" target="_blank">https://www.unielogics.com</a> and click on "Download Extension"</p>
                              <br /><br />
                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Other than this, if you face any kind of issues, or you just want to leave us a feedback, don't hesitate to contact us!</p>
                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Enjoy your journey!</p>
                              <br />
                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                  And one last thing…<br />
                                  DR.Mice wants to formally welcome you to UnieLogics. 
                                  Take 2 minutes to watch this welcome video and the potential behind our platform. 
                              </p><br />
                              <a href="https://www.youtube.com/watch?v=UA4giAM6deg" target="_blank" alt="welcome to UnieLogics video">
                                <img styl="margin: 0 auto;" src="https://www.unielogics.com/images/welcomeVideoThumbnail.png" alt="welcome to UnieLogics image" />
                              </a><br />
                              <a href="https://www.unielogics.com/login"
                                style="background:#a78c36;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Go to Login</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="height:40px;">&nbsp;</td>
                        </tr>
                    </table>
                  </td>
              <tr>
                  <td style="height:20px;">&nbsp;</td>
              </tr>
              <tr>
                  <td style="text-align:center;">
                    <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong ><a href="https://www.unielogics.com" style="color:#a78c36;">www.unielogics.com</a></strong></p>
                  </td>
              </tr>
              <tr>
                  <td style="height:80px;">&nbsp;</td>
              </tr>
            </table>
        </td>
      </tr>
  </table>`,
  };
};

const forgotPasswordMailBody = (from_who, email, randomPassword) => {
  return {
    from: `UnieLogics <${from_who}>`,
    to: email,
    subject: "Forgot Password",
    text: "Forgot Password",
    html: `<table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
      style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
      <tr>
        <td>
            <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
              align="center" cellpadding="0" cellspacing="0">
              <tr>
                  <td style="height:80px;">&nbsp;</td>
              </tr>
              <tr>
                  <td style="height:20px;">&nbsp;</td>
              </tr>
              <tr>
                  <td>
                    <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                        style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                        <tr>
                          <td style="height:40px;">&nbsp;</td>
                        </tr>
                        <tr>
                          <td><img src="https://www.unielogics.com/images/logo.png" alt="Logo" title="Logo" style="display:block;margin:0 auto;margin-bottom:15px;" width="120"/></td>
                        </tr>
                        <tr>
                          <td style="padding:0 35px;">
                              <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                requested to reset your password
                              </h1>
                              <span
                                style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                We cannot simply send you your old password, but in order to help you out, a unique password has been generated for you.<br /> The new password is: <span style="color:red;"><b>${randomPassword}</b></span><br />
                                To login, please click the below button and use the newly generated password.
                              </p>
                              <a href="https://www.unielogics.com/login"
                                style="background:#a78c36;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Go to Login</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="height:40px;">&nbsp;</td>
                        </tr>
                    </table>
                  </td>
              <tr>
                  <td style="height:20px;">&nbsp;</td>
              </tr>
              <tr>
                  <td style="text-align:center;">
                    <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong ><a href="https://www.unielogics.com" style="color:#a78c36;">www.unielogics.com</a></strong></p>
                  </td>
              </tr>
              <tr>
                  <td style="height:80px;">&nbsp;</td>
              </tr>
            </table>
        </td>
      </tr>
  </table>`,
  };
};

module.exports = {
  welcomeMailBody,
  forgotPasswordMailBody,
};
