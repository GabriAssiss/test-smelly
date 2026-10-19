const { UserService } = require('../src/userService');

const dadosUsuarioPadrao = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('deve retornar o usuário criado com os dados informados e status ativo', () => {
      const { nome, email, idade } = dadosUsuarioPadrao;

      const usuarioCriado = userService.createUser(nome, email, idade);

      expect(usuarioCriado).toMatchObject({
        nome,
        email,
        idade,
        isAdmin: false,
        status: 'ativo',
      });
      expect(usuarioCriado.id).toEqual(expect.any(String));
    });

    test('deve gerar ids diferentes para usuários diferentes', () => {
      const { nome, email, idade } = dadosUsuarioPadrao;

      const primeiro = userService.createUser(nome, email, idade);
      const segundo = userService.createUser(nome, email, idade);

      expect(primeiro.id).not.toBe(segundo.id);
    });

    test('deve lançar erro ao criar usuário menor de idade', () => {
      const criarMenorDeIdade = () =>
        userService.createUser('Menor', 'menor@email.com', 17);

      expect(criarMenorDeIdade).toThrow('O usuário deve ser maior de idade.');
    });

    test('deve lançar erro quando um campo obrigatório não é informado', () => {
      const criarSemEmail = () => userService.createUser('Sem Email', '', 30);

      expect(criarSemEmail).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário cadastrado com o id informado', () => {
      const { nome, email, idade } = dadosUsuarioPadrao;
      const usuarioCriado = userService.createUser(nome, email, idade);

      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      expect(usuarioBuscado).toEqual(usuarioCriado);
    });

    test('deve retornar null quando o id não existe', () => {
      const idInexistente = 'id-inexistente';

      const usuarioBuscado = userService.getUserById(idInexistente);

      expect(usuarioBuscado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve desativar um usuário comum', () => {
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      const resultado = userService.deactivateUser(usuarioComum.id);

      expect(resultado).toBe(true);
      expect(userService.getUserById(usuarioComum.id).status).toBe('inativo');
    });

    test('não deve desativar um usuário administrador', () => {
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      const resultado = userService.deactivateUser(usuarioAdmin.id);

      expect(resultado).toBe(false);
      expect(userService.getUserById(usuarioAdmin.id).status).toBe('ativo');
    });

    test('deve retornar false quando o usuário não existe', () => {
      const idInexistente = 'id-inexistente';

      const resultado = userService.deactivateUser(idInexistente);

      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve incluir id, nome e status de cada usuário cadastrado', () => {
      const alice = userService.createUser('Alice', 'alice@email.com', 28);
      const bob = userService.createUser('Bob', 'bob@email.com', 32);
      userService.deactivateUser(bob.id);

      const relatorio = userService.generateUserReport();

      expect(relatorio).toContain(alice.id);
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain(bob.id);
      expect(relatorio).toContain('Bob');
      expect(relatorio).toContain('inativo');
    });

    test('deve informar que não há usuários quando o cadastro está vazio', () => {
      const relatorio = userService.generateUserReport();

      expect(relatorio).toContain('Nenhum usuário cadastrado.');
    });
  });
});
