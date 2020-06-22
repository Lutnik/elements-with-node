module.exports = (host, token) => 
`<DOCTYPE html>
	<head>
		<meta charset="utf-8"/>
		<title> Email reset </title>
	</head>
	<body style="margin: 0; padding: 0;">
		<table border="0" cellpadding="0" cellspacing="0" width="100%">
	    	<tr>
				<td>
					<table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
						<tr>
							<td bgcolor="#ffffff" style="color: #343a40; font-size: 28px; text-align: center; padding: 50px 0px 0px 0px">
								<b> Hello! </b>
							</td>
						</tr>
						<tr>
							<td bgcolor="#ffffff" style="color: #343a40; font-size: 16px; padding: 30px 30px 0px 30px;">
								You are receiving this email because of a password reset request. <br>
								Please use the link below or copy it into yor browser: <br>
							</td>
						</tr>
						<tr>
							<td bgcolor="#ffffff" style="color: #343a40; font-size: 16px; padding: 20px 30px 30px 30px;">
								<a href="https://${host}/user/forgot/${token}" style="color: #343a40;"> 
									https://${host}/user/forgot/${token};
								</a>
							</td>
						</tr>
						<tr>
							<td bgcolor="#ffffff" style="color: #343a40; font-size: 16px; padding: 30px 30px 100px 30px;">
								If you did not request the password reset then simply ignore this message.
							</td>
						</tr>
					</table>
				</td>
	    	</tr>
		</table>	
	</body>
</html>
`;