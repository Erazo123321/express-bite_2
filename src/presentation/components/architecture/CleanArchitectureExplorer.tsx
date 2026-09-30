import React, { useState } from 'react';
import { Layers, ShieldCheck, Cpu, Code2, Activity, CheckCircle, Database } from 'lucide-react';
import { AuditActionLog } from '../../hooks/useCafeteria.ts';

interface CleanArchitectureExplorerProps {
  auditLogs: AuditActionLog[];
}

export const CleanArchitectureExplorer: React.FC<CleanArchitectureExplorerProps> = ({ auditLogs }) => {
  const [selectedTopic, setSelectedTopic] = useState<'solid' | 'layers' | 'code' | 'audit'>('layers');
  const [selectedCodeFile, setSelectedCodeFile] = useState<'product' | 'order' | 'usecase' | 'di'>('product');

  const solidPrinciples = [
    {
      letter: 'S',
      name: 'Single Responsibility Principle (SRP)',
      description: 'Cada clase o caso de uso tiene una única razón para cambiar.',
      application:
        'Cada Use Case (CreateOrderUseCase, UpdateStockUseCase, GetQueueStatsUseCase) maneja exclusivamente una operación de negocio. Las entidades Product y Order solo contienen reglas de negocio invariantes de su dominio, sin depender de bases de datos ni de interfaces de usuario.',
    },
    {
      letter: 'O',
      name: 'Open/Closed Principle (OCP)',
      description: 'Abierto a extensión pero cerrado a modificación.',
      application:
        'Podemos agregar nuevas implementaciones de almacenamiento (e.g. PostgresProductRepository, FirebaseOrderRepository) o pasarelas de pago implementando IProductRepository o IOrderRepository sin tocar ni una línea del dominio o de los casos de uso.',
    },
    {
      letter: 'L',
      name: 'Liskov Substitution Principle (LSP)',
      description: 'Los subtipos deben ser sustituibles por sus tipos base sin alterar el comportamiento.',
      application:
        'InMemoryProductRepository implementa fielmente IProductRepository. Cualquier Use Case funciona idénticamente con el repositorio en memoria o con un repositorio de base de datos remota sin sorpresas ni errores de contrato.',
    },
    {
      letter: 'I',
      name: 'Interface Segregation Principle (ISP)',
      description: 'Los clientes no deben verse forzados a depender de métodos que no usan.',
      application:
        'IProductRepository e IOrderRepository están segregados en interfaces delgadas y cohesivas. Los servicios de notificación (INotificationService) están separados del acceso a datos.',
    },
    {
      letter: 'D',
      name: 'Dependency Inversion Principle (DIP)',
      description: 'Los módulos de alto nivel no dependen de módulos de bajo nivel; ambos dependen de abstracciones.',
      application:
        'CreateOrderUseCase depende de IProductRepository (abstracción en el dominio), nunca de InMemoryProductRepository (infraestructura). La inyección se resuelve en el contenedor DIContainer.',
    },
  ];

  const codeSnippets: Record<string, { title: string; path: string; code: string }> = {
    product: {
      title: 'Entidad Product (Dominio)',
      path: 'src/core/domain/entities/Product.ts',
      code: `export class Product {
  private readonly _id: string;
  private _name: string;
  private _price: Money;
  private _stock: number;

  constructor(props: ProductProps) {
    if (props.stock < 0) throw new Error('Stock cannot be negative');
    this._id = props.id;
    this._name = props.name;
    this._price = props.price;
    this._stock = props.stock;
  }

  hasAvailableStock(requested: number): boolean {
    return this._stock >= requested;
  }

  decrementStock(quantity: number): void {
    if (!this.hasAvailableStock(quantity)) {
      throw new Error('Stock insuficiente');
    }
    this._stock -= quantity;
  }
}`,
    },
    order: {
      title: 'Entidad Order (Dominio)',
      path: 'src/core/domain/entities/Order.ts',
      code: `export class Order {
  private readonly _id: string;
  private readonly _orderNumber: string;
  private readonly _items: OrderItem[];
  private _status: OrderStatus;

  calculateTotal(): Money {
    return this._items.reduce(
      (sum, item) => sum.add(item.getSubtotal()),
      Money.zero()
    );
  }

  transitionTo(nextStatus: OrderStatusType): void {
    if (!this._status.canTransitionTo(nextStatus)) {
      throw new Error('Transición no permitida');
    }
    this._status = new OrderStatus(nextStatus);
  }
}`,
    },
    usecase: {
      title: 'CreateOrderUseCase (Aplicación)',
      path: 'src/core/application/use-cases/CreateOrderUseCase.ts',
      code: `export class CreateOrderUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly orderRepo: IOrderRepository,
    private readonly notifier?: INotificationService
  ) {}

  async execute(dto: CreateOrderDTO): Promise<OrderDTO> {
    // 1. Valida stock en repositorio
    for (const item of dto.items) {
      const prod = await this.productRepo.findById(item.productId);
      if (!prod?.hasAvailableStock(item.quantity)) throw new Error('Sin stock');
    }
    // 2. Crea entidad Order
    const order = new Order({ ... });
    // 3. Decrementa stock
    for (const item of order.items) {
      await this.productRepo.decrementStock(item.productId, item.quantity);
    }
    // 4. Guarda y notifica
    await this.orderRepo.save(order);
    this.notifier?.notifyOrderStatusChanged(order);
    return OrderDTOMapper.toDTO(order);
  }
}`,
    },
    di: {
      title: 'Inversión de Control & DI Container',
      path: 'src/presentation/di/container.ts',
      code: `class DIContainer {
  public readonly productRepository: IProductRepository;
  public readonly orderRepository: IOrderRepository;
  public readonly createOrderUseCase: CreateOrderUseCase;

  constructor() {
    // Infraestructura
    this.productRepository = new InMemoryProductRepository();
    this.orderRepository = new InMemoryOrderRepository();

    // Inyección de dependencias (DIP)
    this.createOrderUseCase = new CreateOrderUseCase(
      this.productRepository,
      this.orderRepository
    );
  }
}
export const container = new DIContainer();`,
    },
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 space-y-6">
      {/* Title */}
      <div className="bg-white rounded-[16px] p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              Clean Architecture & SOLID Architecture Inspector
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Demostración viva del desacoplamiento en 4 capas concéntricas con entidades ricas y lógica orientada a objetos.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200/60 overflow-x-auto">
          <button
            onClick={() => setSelectedTopic('layers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedTopic === 'layers' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Capas Clean Architecture
          </button>
          <button
            onClick={() => setSelectedTopic('solid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedTopic === 'solid' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Principios SOLID
          </button>
          <button
            onClick={() => setSelectedTopic('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedTopic === 'code' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Código Fuente
          </button>
          <button
            onClick={() => setSelectedTopic('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedTopic === 'audit' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Log en Vivo ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TOPIC: LAYERS */}
      {selectedTopic === 'layers' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Layer 1: Domain */}
          <div className="bg-white rounded-xl p-5 border border-emerald-200/80 shadow-xs hover:border-emerald-300 transition">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Núcleo Central
            </span>
            <h3 className="font-bold text-gray-900 text-sm mt-2">1. Domain Layer</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Invariable a frameworks o bases de datos. Contiene reglas de negocio puras.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-gray-700">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px]">Product.ts</span> (Entidad)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px]">Order.ts</span> (Entidad)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px]">Money.ts</span> (Value Object)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px]">IProductRepository.ts</span> (Puerto)
              </li>
            </ul>
          </div>

          {/* Layer 2: Application */}
          <div className="bg-white rounded-xl p-5 border border-blue-200/80 shadow-xs hover:border-blue-300 transition">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Cpu className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Casos de Uso
            </span>
            <h3 className="font-bold text-gray-900 text-sm mt-2">2. Application Layer</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Orquesta el flujo de datos entre entidades y puertos sin acoplamiento.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-gray-700">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-mono text-[11px]">CreateOrderUseCase</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-mono text-[11px]">UpdateStockUseCase</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-mono text-[11px]">GetQueueStatsUseCase</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-mono text-[11px]">ProductDTO / OrderDTO</span>
              </li>
            </ul>
          </div>

          {/* Layer 3: Infrastructure */}
          <div className="bg-white rounded-xl p-5 border border-purple-200/80 shadow-xs hover:border-purple-300 transition">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <Database className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              Adaptadores & Mocks
            </span>
            <h3 className="font-bold text-gray-900 text-sm mt-2">3. Infrastructure Layer</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Implementa los puertos con persistencia en memoria, seeds y navegador.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-gray-700">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="font-mono text-[11px]">InMemoryProductRepo</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="font-mono text-[11px]">InMemoryOrderRepo</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="font-mono text-[11px]">BrowserNotificationSvc</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="font-mono text-[11px]">mockProducts & mockOrders</span>
              </li>
            </ul>
          </div>

          {/* Layer 4: Presentation */}
          <div className="bg-white rounded-xl p-5 border border-amber-200/80 shadow-xs hover:border-amber-300 transition">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Code2 className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Presentación & IoC
            </span>
            <h3 className="font-bold text-gray-900 text-sm mt-2">4. Presentation Layer</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Componentes React, hook desacoplado <span className="font-mono text-[11px]">useCafeteria</span> y contenedor DI.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-gray-700">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-mono text-[11px]">container.ts</span> (IoC Container)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-mono text-[11px]">useCafeteria.ts</span> (Custom Hook)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-mono text-[11px]">StudentView & StaffView</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TOPIC: SOLID */}
      {selectedTopic === 'solid' && (
        <div className="space-y-3">
          {solidPrinciples.map(item => (
            <div
              key={item.letter}
              className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-start"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                {item.letter}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                <p className="text-xs font-semibold text-emerald-700">{item.description}</p>
                <p className="text-xs text-gray-600 leading-relaxed mt-1.5">{item.application}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TOPIC: CODE VIEWER */}
      {selectedTopic === 'code' && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-2.5 overflow-x-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedCodeFile('product')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  selectedCodeFile === 'product' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-gray-600'
                }`}
              >
                Product.ts (Entidad)
              </button>
              <button
                onClick={() => setSelectedCodeFile('order')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  selectedCodeFile === 'order' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-gray-600'
                }`}
              >
                Order.ts (Entidad)
              </button>
              <button
                onClick={() => setSelectedCodeFile('usecase')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  selectedCodeFile === 'usecase' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-gray-600'
                }`}
              >
                CreateOrderUseCase.ts (Aplicación)
              </button>
              <button
                onClick={() => setSelectedCodeFile('di')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  selectedCodeFile === 'di' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-gray-600'
                }`}
              >
                container.ts (DIP Container)
              </button>
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              {codeSnippets[selectedCodeFile].path}
            </span>
          </div>

          <div className="p-4 bg-gray-900 text-gray-100 text-xs font-mono overflow-x-auto">
            <pre className="leading-relaxed">{codeSnippets[selectedCodeFile].code}</pre>
          </div>
        </div>
      )}

      {/* TOPIC: LIVE AUDIT LOG */}
      {selectedTopic === 'audit' && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Registro de Ejecución de Casos de Uso</h3>
              <p className="text-xs text-gray-500">
                Cada clic en la UI dispara un caso de uso independiente a través del DIContainer.
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              Auditoría en tiempo real
            </span>
          </div>

          {auditLogs.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {auditLogs.map(log => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-700">{log.useCaseName}</span>
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded">
                        {log.layer} Layer
                      </span>
                    </div>
                    <p className="text-gray-700">{log.summary}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 tabular-nums shrink-0">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">
              Interactúa con la vista de estudiante o de personal para ver la ejecución de casos de uso aquí.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
