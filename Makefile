run:
	@npm install
	@cd backend && npm install
	@npm run build
	@npm run preview &
	@cd backend && node proxy.js

run_dev:
	@npm install
	@cd backend && npm install
	@npm run dev &
	@cd backend && node --watch proxy.js