run:
	@npm install
	@cd core && npm install
	@npm run build
	@npm run preview &
	@cd core && node proxy.js

run_dev:
	@npm install
	@cd core && npm install
	@npm run dev &
	@cd core && node --watch proxy.js