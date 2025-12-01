import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import toast from 'react-hot-toast';
 
// Funções de máscara
const phoneMask = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
    .slice(0, 15);
};
 
const crpMask = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 11);
};
 
// Validação de senha
const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
 
  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol,
    errors: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSymbol
    }
  };
};
 
export const Register = () => {
  const [userType, setUserType] = useState('paciente');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    crp: '',
    specialty: '',
    phone: '',
    birthDate: ''
  });
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSymbol: false
    }
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
 
  const handleInputChange = useCallback((field) => (e) => {
    let value = e.target.value;
   
    // Aplicar máscaras
    if (field === 'phone') {
      value = phoneMask(value);
    } else if (field === 'crm') {
      value = crpMask(value);
    }
   
    setFormData(prev => ({ ...prev, [field]: value }));
   
    // Validar senha em tempo real
    if (field === 'password') {
      setPasswordValidation(validatePassword(value));
    }
  }, []);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    // Validações
    if (!passwordValidation.isValid) {
      toast.error('A senha não atende aos critérios de segurança');
      return;
    }
 
    if (formData.password !== formData.confirmPassword) {
      toast.error('Senhas não coincidem');
      return;
    }
 
    // Validar telefone
    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      toast.error('Telefone deve ter 10 ou 11 dígitos');
      return;
    }
 
    // Validar CRP para psicólogos
    if (userType === 'psicologo') {
      const crpNumbers = formData.crp.replace(/\D/g, '');
      if (crpNumbers.length < 6) {
        toast.error('CRP deve ter pelo menos 6 dígitos');
        return;
      }
    }
 
    setLoading(true);
 
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        type: userType === 'psicologo' ? 'psicologo' : 'paciente',
        phone: formData.phone.replace(/\D/g, '') || null,
        ...(userType === 'psicologo' && {
          specialty: formData.specialty,
          crp: formData.crm.replace(/\D/g, '')
        }),
        ...(userType === 'paciente' && {
          birth_date: formData.birthDate
        })
      };
     
      console.log('Payload enviado:', payload);
      await register(payload);
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-2 sm:p-4">
      <Card className="w-500 max-w-xs sm:max-w-lg">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-4xl font-bold text-dark mb-2">{"Criar Conta"}</h1>
          <p className="text-xs sm:text-base text-dark/70">Cadastre-se na lunysse</p>
        </div>
 
        {/* User Type Selector */}
        <div className="flex mb-3 sm:mb-6 gap-1 sm:gap-2">
          <Button
            type="button"
            variant={userType === 'paciente' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setUserType('paciente')}
            className="flex-1 text-sm sm:text-base"
          >
            {"Paciente"}
          </Button>
          <Button
            type="button"
            variant={userType === 'psicologo' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setUserType('psicologo')}
            className="flex-1 text-sm sm:text-base"
          >
            {"Psicólogo"}
          </Button>
        </div>
 
        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
          <Input
            label="Nome completo"
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="Seu nome completo"
            required
          />
 
          <Input
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="seu@email.com"
            required
          />
 
          <div>
            <Input
              label="Senha"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder="Sua senha"
              required
            />
            {formData.password && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Critérios de segurança:</p>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${
                    passwordValidation.errors.minLength ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>{passwordValidation.errors.minLength ? '✓' : '✗'}</span>
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    passwordValidation.errors.hasUpperCase ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>{passwordValidation.errors.hasUpperCase ? '✓' : '✗'}</span>
                    <span>Pelo menos 1 letra maiúscula</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    passwordValidation.errors.hasLowerCase ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>{passwordValidation.errors.hasLowerCase ? '✓' : '✗'}</span>
                    <span>Pelo menos 1 letra minúscula</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    passwordValidation.errors.hasNumber ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>{passwordValidation.errors.hasNumber ? '✓' : '✗'}</span>
                    <span>Pelo menos 1 número</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    passwordValidation.errors.hasSymbol ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>{passwordValidation.errors.hasSymbol ? '✓' : '✗'}</span>
                    <span>Pelo menos 1 símbolo (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
 
          <Input
            label="Confirmar senha"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Confirme sua senha"
            required
          />
 
          {/* Campos específicos para psicólogo */}
          {userType === 'psicologo' && (
            <>
              <Input
                label="CRP (Conselho Regional de Psicologia)"
                value={formData.crp}
                onChange={handleInputChange('crm')}
                placeholder="Ex: CRP 01/12345"
                maxLength="8"
                required
              />
 
              <Input
                label="Especialidade"
                value={formData.specialty}
                onChange={handleInputChange('specialty')}
                placeholder="Ex: Psicologia Clínica, Terapia Cognitiva"
                required
              />
 
              <Input
                label="Telefone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="(11) 99999-9999"
                maxLength="15"
                required
              />
            </>
          )}
 
          {/* Campos específicos para paciente */}
          {userType === 'paciente' && (
            <>
              <Input
                label="Telefone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="(11) 99999-9999"
                maxLength="15"
                required
              />
 
              <Input
                label="Data de nascimento"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange('birthDate')}
                required
              />
            </>
          )}
 
          <Button
            type="submit"
            loading={loading}
            className="w-full text-sm sm:text-base"
          >
            Cadastrar
          </Button>
        </form>
 
        <div className="mt-3 sm:mt-6 text-center space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-base text-dark/70">
            {"Já tem uma conta?"}{' '}
            <Link to="/login" className="text-light hover:text-accent font-medium">
              {"Fazer login"}
            </Link>
          </p>
          <p className="text-xs sm:text-base text-dark/70">
            <Link to="/" className="text-light hover:text-accent font-medium">
              {"← Voltar ao início"}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};