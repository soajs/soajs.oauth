You need to create a certificate to be able to run https server. 

Commands:

`openssl genrsa -out key.pem

openssl req -new -key key.pem -out csr.pem

openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem

rm csr.pem`