#!/bin/bash

echo "=== iOS SSL 诊断脚本 ==="
echo ""

echo "1. 检查证书文件是否存在："
ls -la /etc/letsencrypt/live/hzqstudio.store/

echo ""
echo "2. 检查证书链完整性："
openssl crl2pkcs7 -nocrl -certfile /etc/letsencrypt/live/hzqstudio.store/fullchain.pem | openssl pkcs7 -print_certs -noout | grep "subject"

echo ""
echo "3. 检查证书有效期："
openssl x509 -in /etc/letsencrypt/live/hzqstudio.store/fullchain.pem -noout -dates

echo ""
echo "4. 检查 Nginx 配置语法："
aa_nginx -t

echo ""
echo "5. 检查 Nginx 进程："
ps aux | grep nginx | grep -v grep

echo ""
echo "6. 本地测试 HTTPS 连接："
curl -v https://localhost/health 2>&1 | head -20

echo ""
echo "=== 诊断完成 ==="