import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './src/db/migrations',
	schema: './src/db/schema/index.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
		ssl: {
			rejectUnauthorized: false,
			ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUMSXCq707TEKb38mmcvv4sznSRk4wDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvYzQ5YTRjZWUtNWVlNi00MWE4LTllZDItODJiZjdjNDUy
ZjU4IFByb2plY3QgQ0EwHhcNMjQwNjEyMjEwNTQzWhcNMzQwNjEwMjEwNTQzWjA6
MTgwNgYDVQQDDC9jNDlhNGNlZS01ZWU2LTQxYTgtOWVkMi04MmJmN2M0NTJmNTgg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAKEBcg4l
CDXPkfXrjZS1L3kITveGRzHKjlodkj1VDQu3Eul27bApyCOUESLQxo8DK/b2py7j
W4cAMSidD0OkOWgtcr+zjpaZg1nepxWoafRSrZz5WM4e2iOoPijPV2qI4uDr/AY8
SojBi6XtzWRJZG2dnCGBthHELRp7bfNJOXycwfiiTdw0XwNrd+w5qr1q5TKBz2Fl
L3d1TTov/5CM71voqydvJuzCTKDPn6XEkgNYkOuL79OhUMqgA9JlABtiQ9MPdhUF
Y40EzpnqHkdX5yV87aP2ocWOQx9QkmAwAqADZfmkWrUnQ84TkoUKtHO1/h4AAEcj
+StNSGB46rsosvrUcY0m/KCordT1n6WCqs+AOo/yGS5TN/Rm0CwoQ4TD0loiBrH1
N5LZc/7MYGTaNXh4iAlhhOkxkf4bUnJ4HkCkROX4AUANvvz4gLcct478VdwTXsCC
doi6AkfLbrms0rI78LkBdAqfj0D3+kUv+zacO2yR/Udx6ytaANB2CwWclwIDAQAB
oz8wPTAdBgNVHQ4EFgQU3FzB9uWumAHo93n8Qrudqo61cd8wDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAGzZHQPKcs4zXald
Qm38DkPrNMyzp8fhO+geMlwqdMBqlkXmLhyCrrwmr/GLE6W3cdnzqhW4a+8ZHZy5
09rMr5ohDzEWHsV6g/khNPCj/M8uh+PN8rNJJn1EufhgAgt1gOepKjCoPDBTBH5A
rmfFCECtSYJQJ8JBBQQ8WslVjO0gC51fBlGqT2ogpiJ7w4r5pODJ7gKaRYZJ1CoP
3IbPgbHF/db0RTrukOcP17IzoHegy56SdBNCt5vbm23QRsnyMAm35rIXFY6SQHtI
T5R8eR08E2CaBZziGlq3kApOJJbTYaPDK+gZ6pNZT6vmMkFcLWb7fX9j8KJLSbAC
8UE5rA9sOYigKtEP2zra3n+M0HZVelMvxjmwcy1Gy97aLYIL8Udk9uSJ2yzyaC+M
mMNvaXWQWCSw+o5EVioTisXCAE9QTfFMpHLTR8WRkRrj+luGa1WpuD6yiNLVq0k9
2gDWXaA3Gw+3Wd2s8AGNnIFF4miT3d3G2hQ2wqQCZBzHGXxDlQ==
-----END CERTIFICATE-----
`, // 👈 put the CA into .env
		},
	},
	verbose: true,
	strict: true,
});
