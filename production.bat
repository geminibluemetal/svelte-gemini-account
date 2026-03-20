@echo off
echo Starting update process...

call cd C:\GeminiApp 
call git pull
call pm2 delete 0
call npm run build
call pm2 start ecosystem.config.cjs
call pm2 save

echo Update complete!
pause