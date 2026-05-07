# Contributing

Contributions are welcome. Here's how to help:

1. **Fork** the repository
2. **Create a branch** (`git checkout -b feature/your-idea`)
3. **Make your changes**
4. **Run the build** (`npm run build`) — ensure it passes
5. **Commit** (`git commit -m "Add your feature"`)
6. **Push** (`git push origin feature/your-idea`)
7. **Open a Pull Request**

## Guidelines

- Keep the tool free and serverless-friendly (no database, no auth)
- New analyzers should be added as modules in `lib/analyzers/`
- Frontend components go in `app/components/`
- No external analytics or tracking
- Tests are appreciated but not required
