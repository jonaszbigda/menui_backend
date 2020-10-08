function makeResetPassMessage(link) {
  return {
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <title>Menui - Resetowanie hasła</title>
        <style type="text/css">
          body {
            font-family: "Montserrat", sans-serif;
            margin: 0;
            padding: 0;
            min-width: 100% !important;
          }
          .table {
            margin-top: 26px;
            max-width: 600px;
          }
          .titlebar {
            text-align: center;
          }
          .content {
            padding-bottom: 20px;
            color: #ffffff;
            text-align: center;
            font-size: 13px;
          }
          .content p {
            margin: 12px;
            padding-right: 24px;
            padding-left: 24px;
            line-height: 1.6;
          }
          .logo {
            padding-top: 30px;
            padding-bottom: 30px;
          }
          .footer {
            font-size: 13px;
          }
          hr {
            border: none;
            border-top: solid 1px #262626;
          }
          .title {
            font-size: 20px;
            margin-bottom: 26px;
            color: #d68000;
          }
          .link {
            padding: 16px;
            font-size: 14px;
            font-weight: 700;
            background-color: #d68000;
          }
          .link a {
            color: #262626;
            text-decoration: none;
          }
        </style>
      </head>
      <body bgcolor="#262626">
        <table
          width="100%"
          class="table"
          bgcolor="#454545"
          border="0"
          cellpadding="0"
          cellspacing="0"
          align="center"
        >
          <tr>
            <td>
              <table align="center" class="logo">
                <tr>
                  <td>
                    <img src="cid:logo" width="100" alt="Menui - food guide" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" class="titlebar" bgcolor="#666666">
                <tr>
                  <td>
                    <h3 class="title">Resetowanie hasła</h3>
                    <hr />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" class="content" bgcolor="#666666">
                <tr>
                  <td>
                    <p>
                      Drogi użytkowniku, dostałeś tę wiadomość, ponieważ użyłeś
                      opcji "Nie pamiętam hasła" w aplikacji Menui.
                    </p>
                    <p>Kliknij w ten link, by ustawić nowe hasło:</p>
                    <table width="100%">
                      <tr>
                        <td>
                          <table width="30%" align="center" class="link">
                            <tr>
                              <td>
                                <a href="${link}">Resetuj hasło</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p>
                      Jeżeli nie wysyłałeś prośby o zmianę hasła, prosimy zignoruj
                      tę wiadomość.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table align="center">
                <tr>
                  <td>
                    <p class="footer">Pozdrawiamy! - Zespół Menui</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `,
    text: `Drogi użytkowniku, dostałeś tę wiadomość, ponieważ użyłeś opcji "Nie pamiętam hasła" w aplikacji Menui. Twoje tymczasowe hasło to: ${link}. Zaloguj się za jego pomocą i ustaw nowe bezpieczne hasło. Jeżeli nie wysyłałeś prośby o zmianę hasła, prosimy zignoruj tę wiadomość. Pozdrawiamy - Zespół Menui`,
  };
}

module.exports = makeResetPassMessage;
